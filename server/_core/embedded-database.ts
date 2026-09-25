/**
 * Zero-setup database runtime for MEDORA.
 *
 * MEDORA requires a MySQL-compatible database. This module removes that
 * external prerequisite: when `DATABASE_URL` is not configured, it boots an
 * embedded MySQL server managed entirely inside the workspace:
 *
 *  1. Resolve a `mysqld` binary: explicit `MEDORA_MYSQLD_BIN` override, the
 *     project runtime cache (`.medora-runtime/mysql/`), the shared
 *     `mysql-memory-server` download cache, or a one-time download via the
 *     `mysql-memory-server` package (cached for every later boot).
 *  2. On Linux, make the vendored `libaio` / `libnuma` libraries visible to
 *     `mysqld` through `LD_LIBRARY_PATH` (no system packages required).
 *  3. Initialize a persistent data directory (`.medora-data/mysql/`) once.
 *  4. Start or reuse the server, then point `DATABASE_URL` at it.
 *  5. Apply Drizzle migrations (idempotent) and seed the administrative
 *     account, RBAC permissions, delivery zones, and the CC0 Egyptian drug
 *     catalog on first boot.
 *
 * Nothing outside the workspace is touched: no services, no accounts, no
 * global packages. Setting `DATABASE_URL` explicitly always bypasses this
 * module entirely (production/managed database mode).
 */

import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { createConnection } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";

const sleep = promisify(setTimeout);

const RUNTIME_DIR_NAME = ".medora-data";
const MYSQL_CACHE_DIR_NAME = ".medora-runtime";
const BOOTSTRAP_MARKER = "bootstrapped-v1";

function projectRoot(): string {
  // `pnpm dev`, `pnpm setup`, and `pnpm start` all run with the package root
  // as the working directory. Fall back to walking up from this file for
  // direct `node dist/index.js` invocations from other directories.
  if (fs.existsSync(path.join(process.cwd(), "package.json"))) return process.cwd();
  let dir = import.meta.dirname;
  for (let i = 0; i < 6; i += 1) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    dir = path.resolve(dir, "..");
  }
  return process.cwd();
}

const ROOT = projectRoot();
const DATA_DIR = path.join(ROOT, RUNTIME_DIR_NAME);
const MYSQL_DATA_DIR = path.join(DATA_DIR, "mysql");
const MYSQL_CACHE_DIR = path.join(ROOT, MYSQL_CACHE_DIR_NAME, "mysql");
const VENDOR_LIB_DIR = path.join(ROOT, "vendor", "libaio");

export type EmbeddedDatabaseInfo = {
  mode: "embedded" | "external";
  port: number | null;
  dataDir: string | null;
};

let runningHandle: { port: number; proc: ReturnType<typeof spawn> | null } | null = null;

function log(message: string) {
  console.log(`[medora-db] ${message}`);
}

function warn(message: string) {
  console.warn(`[medora-db] ${message}`);
}

// ---------------------------------------------------------------------------
// Runtime secret
// ---------------------------------------------------------------------------

function ensureJwtSecret(): void {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) return;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const secretPath = path.join(DATA_DIR, "runtime-secret");
  if (fs.existsSync(secretPath)) {
    const existing = fs.readFileSync(secretPath, "utf8").trim();
    if (existing.length >= 32) {
      process.env.JWT_SECRET = existing;
      return;
    }
  }
  const secret = randomBytes(48).toString("hex");
  fs.writeFileSync(secretPath, secret, { mode: 0o600 });
  process.env.JWT_SECRET = secret;
  log("generated a stable local JWT secret (persisted to .medora-data/runtime-secret)");
}

// ---------------------------------------------------------------------------
// mysqld binary resolution
// ---------------------------------------------------------------------------

function findHighestVersionDir(baseDir: string): string | null {
  if (!fs.existsSync(baseDir)) return null;
  const versions = fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => /^\d+\.\d+\.\d+/.test(name))
    .sort((a, b) => b.localeCompare(a, "en", { numeric: true }));
  for (const version of versions) {
    const candidate = path.join(baseDir, version, "mysql", "bin", process.platform === "win32" ? "mysqld.exe" : "mysqld");
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function makeExecutable(baseDir: string): void {
  const binDir = path.join(baseDir, "bin");
  if (!fs.existsSync(binDir)) return;
  for (const entry of fs.readdirSync(binDir)) {
    const p = path.join(binDir, entry);
    try {
      fs.chmodSync(p, 0o755);
    } catch {
      /* best effort */
    }
  }
}

async function downloadMysqlBinary(): Promise<string | null> {
  try {
    const { createDB } = (await import("mysql-memory-server")) as {
      createDB: (options?: Record<string, unknown>) => Promise<{ stop: () => Promise<void> }>;
    };
    log("downloading an embedded MySQL server (one-time, cached for all future boots)…");
    const db = await createDB({ dbName: `medora-bootstrap-${Date.now()}`, logLevel: "WARN" });
    await db.stop();
    const downloaded = findHighestVersionDir(path.join(os.tmpdir(), "mysqlmsn", "binaries"));
    if (!downloaded) return null;
    const versionDir = path.basename(path.resolve(path.dirname(path.dirname(path.dirname(downloaded)))));
    const destination = path.join(MYSQL_CACHE_DIR, versionDir);
    fs.mkdirSync(MYSQL_CACHE_DIR, { recursive: true });
    try {
      fs.symlinkSync(path.dirname(path.dirname(path.dirname(downloaded))), destination, "dir");
    } catch {
      fs.cpSync(path.dirname(path.dirname(path.dirname(downloaded))), destination, { recursive: true });
      makeExecutable(destination);
    }
    return findHighestVersionDir(MYSQL_CACHE_DIR);
  } catch (error) {
    warn(`could not download the embedded MySQL binary: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function resolveMysqldPath(): Promise<string | null> {
  const explicit = process.env.MEDORA_MYSQLD_BIN;
  if (explicit) {
    if (fs.existsSync(explicit)) return Promise.resolve(explicit);
    warn(`MEDORA_MYSQLD_BIN is set but the file does not exist: ${explicit}`);
  }
  const local = findHighestVersionDir(MYSQL_CACHE_DIR);
  if (local) return Promise.resolve(local);
  const sharedCache = findHighestVersionDir(path.join(os.tmpdir(), "mysqlmsn", "binaries"));
  if (sharedCache) {
    const versionDir = path.basename(path.resolve(path.dirname(path.dirname(path.dirname(sharedCache)))));
    const destination = path.join(MYSQL_CACHE_DIR, versionDir);
    fs.mkdirSync(MYSQL_CACHE_DIR, { recursive: true });
    try {
      fs.symlinkSync(path.dirname(path.dirname(path.dirname(sharedCache))), destination, "dir");
    } catch {
      /* already linked or copy not critical */
    }
    return Promise.resolve(sharedCache);
  }
  return downloadMysqlBinary();
}

// ---------------------------------------------------------------------------
// Server lifecycle
// ---------------------------------------------------------------------------

function tcpProbe(port: number, timeoutMs = 750): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port });
    const finish = (ok: boolean) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

async function selectProbe(port: number): Promise<boolean> {
  try {
    const conn = await createConnection({ host: "127.0.0.1", port, user: "root", password: "", connectTimeout: 1500 });
    await conn.query("SELECT 1");
    await conn.end();
    return true;
  } catch {
    return false;
  }
}

function prepareLinuxLibraries(): void {
  if (process.platform !== "linux") return;
  if (!fs.existsSync(VENDOR_LIB_DIR)) return;
  const current = process.env.LD_LIBRARY_PATH ?? "";
  if (!current.split(":").includes(VENDOR_LIB_DIR)) {
    process.env.LD_LIBRARY_PATH = current ? `${VENDOR_LIB_DIR}:${current}` : VENDOR_LIB_DIR;
  }
}

function mysqldArguments(mysqldPath: string, port: number): string[] {
  const basedir = path.resolve(path.dirname(path.dirname(mysqldPath)));
  const args = [
    "--no-defaults",
    `--basedir=${basedir}`,
    `--datadir=${MYSQL_DATA_DIR}`,
    `--lc-messages-dir=${path.join(basedir, "share")}`,
    `--tmpdir=${path.join(DATA_DIR, "tmp")}`,
    `--port=${port}`,
    "--bind-address=127.0.0.1",
    "--mysqlx=OFF",
    "--skip-name-resolve",
    `--pid-file=${path.join(DATA_DIR, "mysqld.pid")}`,
  ];
  if (process.platform === "win32") {
    args.push("--console");
  } else {
    args.push(`--socket=${path.join(DATA_DIR, "mysql.sock")}`);
    if (typeof process.getuid === "function" && process.getuid() === 0) {
      args.push("--user=root");
    }
  }
  return args;
}

async function initializeDataDirectory(mysqldPath: string): Promise<void> {
  if (fs.existsSync(path.join(MYSQL_DATA_DIR, "mysql"))) return; // already initialized
  fs.mkdirSync(MYSQL_DATA_DIR, { recursive: true });
  // mysqld requires tmpdir to exist before initialization.
  fs.mkdirSync(path.join(DATA_DIR, "tmp"), { recursive: true });
  const basedir = path.resolve(path.dirname(path.dirname(mysqldPath)));
  const args = [
    "--no-defaults",
    `--basedir=${basedir}`,
    `--datadir=${MYSQL_DATA_DIR}`,
    `--lc-messages-dir=${path.join(basedir, "share")}`,
    `--tmpdir=${path.join(DATA_DIR, "tmp")}`,
    "--initialize-insecure",
  ];
  if (process.platform !== "win32" && typeof process.getuid === "function" && process.getuid() === 0) {
    args.push("--user=root");
  }
  log("initializing the embedded database data directory (first boot only)…");

  // `--initialize-insecure` creates only `root@localhost`. Later we start the
  // server with `--skip-name-resolve`, under which TCP clients connecting from
  // 127.0.0.1 do NOT match the `localhost` host — so provide an explicit
  // `root@127.0.0.1` account via the server init file.
  const initFile = path.join(DATA_DIR, "init.sql");
  fs.writeFileSync(
    initFile,
    "CREATE USER IF NOT EXISTS 'root'@'127.0.0.1' IDENTIFIED BY '';\n"
      + "GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' WITH GRANT OPTION;\n"
      + "FLUSH PRIVILEGES;\n",
    "utf8"
  );
  args.push(`--init-file=${initFile}`);

  const result = spawnSync(mysqldPath, args, { stdio: ["ignore", "pipe", "pipe"], env: process.env });
  if (result.status !== 0) {
    const output = `${result.stdout?.toString() ?? ""}${result.stderr?.toString() ?? ""}`;
    throw new Error(`mysqld --initialize-insecure failed: ${output.slice(-2000)}`);
  }
  log("data directory initialized");
}

async function pickPort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

async function startEmbeddedMysql(): Promise<number> {
  const mysqldPath = await resolveMysqldPath();
  if (!mysqldPath) {
    throw new Error(
      "No embedded MySQL binary is available. Set DATABASE_URL to an existing MySQL server, or allow the one-time download by re-running the app with internet access."
    );
  }

  // Reuse a previously started embedded server when its port is still live.
  const portFile = path.join(DATA_DIR, "mysql.port");
  if (fs.existsSync(portFile)) {
    const previousPort = Number(fs.readFileSync(portFile, "utf8").trim());
    if (Number.isFinite(previousPort) && previousPort > 0 && (await selectProbe(previousPort))) {
      log(`reusing the embedded MySQL server already listening on port ${previousPort}`);
      return previousPort;
    }
  }

  prepareLinuxLibraries();
  await initializeDataDirectory(mysqldPath);
  fs.mkdirSync(path.join(DATA_DIR, "tmp"), { recursive: true });

  const port = await pickPort();
  const logFile = path.join(DATA_DIR, "mysqld.out.log");
  const out = fs.openSync(logFile, "a");
  log(`starting embedded MySQL on port ${port} (logs: ${RUNTIME_DIR_NAME}/mysqld.out.log)…`);
  const proc = spawn(mysqldPath, mysqldArguments(mysqldPath, port), {
    stdio: ["ignore", out, out],
    env: process.env,
  });
  runningHandle = { port, proc };
  proc.once("exit", (code) => {
    if (runningHandle?.proc === proc) runningHandle = null;
    if (code && code !== 0) warn(`embedded MySQL exited with code ${code}; see ${logFile}`);
  });

  // Wait for readiness.
  const deadline = Date.now() + 90_000;
  let ready = false;
  while (Date.now() < deadline) {
    if (proc.exitCode !== null) break;
    if (await selectProbe(port)) {
      ready = true;
      break;
    }
    await sleep(500);
  }
  fs.closeSync(out);
  if (!ready) {
    throw new Error(`embedded MySQL did not become ready; check ${logFile}`);
  }

  fs.writeFileSync(portFile, String(port), "utf8");
  const conn = await createConnection({ host: "127.0.0.1", port, user: "root", password: "" });
  await conn.query("CREATE DATABASE IF NOT EXISTS `medora` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
  await conn.end();
  return port;
}

export async function stopEmbeddedDatabase(): Promise<void> {
  const handle = runningHandle;
  runningHandle = null;
  if (!handle) return;
  const { port, proc } = handle;
  if (proc && proc.exitCode === null) {
    log("stopping the embedded MySQL server…");
    const mysqladmin = path.resolve(path.dirname(proc.spawnfile), "mysqladmin");
    if (fs.existsSync(mysqladmin)) {
      spawnSync(mysqladmin, ["--no-defaults", `--port=${port}`, "--host=127.0.0.1", "--user=root", "shutdown"], {
        stdio: "ignore",
        env: process.env,
        timeout: 15_000,
      });
    } else {
      proc.kill("SIGTERM");
    }
    await Promise.race([
      new Promise<void>((resolve) => proc.once("exit", () => resolve())),
      sleep(15_000).then(() => proc.kill("SIGKILL")),
    ]);
    log("embedded MySQL stopped");
  }
}

// ---------------------------------------------------------------------------
// Schema bootstrap and first-run seeding
// ---------------------------------------------------------------------------

async function applyJurisdictionRepair(): Promise<void> {
  // Mirrors scripts/run-test-database-migrations.ts: a known historical drift
  // where three tables are missing the jurisdictionId column after
  // migrations. Fail-closed repair, safe to re-run.
  const url = process.env.DATABASE_URL as string;
  const conn = await createConnection({ uri: url, multipleStatements: true });
  try {
    const tables = ["branches", "customer_profiles", "call_tickets"] as const;
    const hasColumn = async (table: string) => {
      const [rows] = await conn.query(
        `SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'jurisdictionId'`,
        [table]
      );
      return Number((rows as Array<{ count: number }>)[0]?.count ?? 0) === 1;
    };
    for (const table of tables) {
      if (!(await hasColumn(table))) {
        await conn.query(`ALTER TABLE \`${table}\` ADD \`jurisdictionId\` int`);
        log(`applied jurisdiction repair: ${table}.jurisdictionId`);
      }
    }
  } finally {
    await conn.end();
  }
}

function runSeedScript(script: string, args: string[] = []): boolean {
  const scriptPath = path.join(ROOT, "scripts", script);
  if (!fs.existsSync(scriptPath)) {
    warn(`seed script not found, skipping: scripts/${script}`);
    return false;
  }
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: ROOT,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 10 * 60_000,
  });
  const output = `${result.stdout?.toString() ?? ""}${result.stderr?.toString() ?? ""}`.trim();
  if (output) log(output.split("\n").slice(-6).join("\n"));
  if (result.status !== 0) {
    warn(`seed script failed (exit ${result.status}): scripts/${script}`);
    return false;
  }
  return true;
}

async function bootstrapSchemaAndSeedData(): Promise<void> {
  const url = process.env.DATABASE_URL as string;
  const drizzleDb = drizzle(url);
  log("applying database migrations…");
  await migrate(drizzleDb, { migrationsFolder: path.join(ROOT, "drizzle") });
  await applyJurisdictionRepair();

  const markerPath = path.join(DATA_DIR, BOOTSTRAP_MARKER);
  if (fs.existsSync(markerPath)) return;

  log("first boot: provisioning the administrative account and reference data…");
  process.env.MEDORA_ADMIN_USERNAME = process.env.MEDORA_ADMIN_USERNAME || "admin";
  process.env.MEDORA_ADMIN_PASSWORD = process.env.MEDORA_ADMIN_PASSWORD || "admin";

  runSeedScript("provision-medora.mjs", process.env.MEDORA_SEED_DRUGS === "0" ? [] : ["--drugs", path.join(ROOT, "data", "egyptian-drugs.csv")]);
  runSeedScript("seed-rbac-and-roles.mjs");
  runSeedScript("seed-delivery-zones.mjs");

  fs.writeFileSync(markerPath, new Date().toISOString(), "utf8");
  log("first-boot provisioning complete");
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Prepare the runtime environment before any server code touches the
 * database. With `DATABASE_URL` configured this is a no-op beyond making sure
 * a `JWT_SECRET` exists. Otherwise it boots (or reuses) the embedded MySQL
 * server, migrates the schema, and seeds first-run data.
 */
export async function prepareRuntimeEnvironment(): Promise<EmbeddedDatabaseInfo> {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  ensureJwtSecret();
  if (process.env.DATABASE_URL) {
    return { mode: "external", port: null, dataDir: null };
  }
  const port = await startEmbeddedMysql();
  process.env.DATABASE_URL = `mysql://root@127.0.0.1:${port}/medora`;
  await bootstrapSchemaAndSeedData();
  return { mode: "embedded", port, dataDir: MYSQL_DATA_DIR };
}
