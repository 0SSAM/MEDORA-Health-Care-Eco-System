const { app, BrowserWindow, dialog } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const net = require("node:net");
const { spawn } = require("node:child_process");

const DB_PORT = 33306;
const APP_PORT = 3000;
const DB_NAME = "medora_local";
const DB_USER = "medora_local";
let dbProcess = null;

function runtimeRoot() {
  return path.join(app.getPath("userData"), "runtime");
}

function dbRoot() {
  return path.join(runtimeRoot(), "mariadb");
}

function dbData() {
  return path.join(dbRoot(), "data");
}

function dbPasswordFile() {
  return path.join(runtimeRoot(), "database.json");
}

function dbPassword() {
  const file = dbPasswordFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8")).password;
  const password = crypto.randomBytes(24).toString("base64url");
  fs.writeFileSync(file, JSON.stringify({ password }, null, 2), { mode: 0o600 });
  return password;
}

function bundledMariaDbRoot() {
  return path.join(process.resourcesPath, "mariadb");
}

function executable(name) {
  return path.join(bundledMariaDbRoot(), "bin", name);
}

function waitForPort(port, host = "127.0.0.1", timeoutMs = 30000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const probe = () => {
      const socket = net.createConnection({ port, host });
      socket.once("connect", () => { socket.destroy(); resolve(); });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) reject(new Error(`Timed out waiting for ${host}:${port}`));
        else setTimeout(probe, 250);
      });
    };
    probe();
  });
}

function run(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      windowsHide: true,
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk.toString(); });
    child.stderr.on("data", chunk => { stderr += chunk.toString(); });
    child.once("error", reject);
    child.once("exit", code => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${path.basename(command)} exited with code ${code}\n${stderr || stdout}`));
    });
  });
}

async function initializeDatabase() {
  fs.mkdirSync(runtimeRoot(), { recursive: true });
  if (!fs.existsSync(executable("mariadbd.exe"))) {
    throw new Error("Bundled MariaDB runtime is missing from the portable package.");
  }

  const password = dbPassword();
  if (!fs.existsSync(path.join(dbData(), "mysql"))) {
    fs.mkdirSync(dbData(), { recursive: true });
    await run(executable("mariadb-install-db.exe"), [
      `--datadir=${dbData()}`,
      `--port=${DB_PORT}`,
      `--password=${password}`,
      "--silent",
    ]);
  }

  dbProcess = spawn(executable("mariadbd.exe"), [
    `--datadir=${dbData()}`,
    `--port=${DB_PORT}`,
    "--bind-address=127.0.0.1",
    "--skip-name-resolve",
    "--max_connections=80",
    "--console",
  ], {
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  dbProcess.stdout.on("data", chunk => console.log(`[MariaDB] ${chunk}`));
  dbProcess.stderr.on("data", chunk => console.log(`[MariaDB] ${chunk}`));
  dbProcess.once("exit", code => console.log(`[MariaDB] exited: ${code}`));

  await waitForPort(DB_PORT);

  const sql = [
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    `CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${password.replace(/'/g, "''")}';`,
    `ALTER USER '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${password.replace(/'/g, "''")}';`,
    `GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';`,
    "FLUSH PRIVILEGES;",
  ].join(" ");

  await run(executable("mariadb.exe"), [
    "--protocol=tcp",
    "-h127.0.0.1",
    `-P${DB_PORT}`,
    "-uroot",
    "-e",
    sql,
  ], { MYSQL_PWD: password });

  process.env.DATABASE_URL = `mysql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(password)}@127.0.0.1:${DB_PORT}/${DB_NAME}`;
}

async function migrateDatabase() {
  const { createPool } = require("mysql2/promise");
  const { drizzle } = require("drizzle-orm/mysql2");
  const { migrate } = require("drizzle-orm/mysql2/migrator");
  const pool = createPool(process.env.DATABASE_URL);
  const db = drizzle(pool);
  const migrationsFolder = path.join(app.getAppPath(), "drizzle");
  await migrate(db, { migrationsFolder });
  await pool.end();
}

async function startMedoraServer() {
  process.env.NODE_ENV = "production";
  process.env.PORT = String(APP_PORT);
  process.env.JWT_SECRET ||= crypto.randomBytes(48).toString("hex");
  process.env.MEDORA_DESKTOP_MODE = "1";
  await import(path.join(app.getAppPath(), "dist", "index.js"));
  await waitForPort(APP_PORT, "127.0.0.1", 30000);
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#0b1220",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.once("ready-to-show", () => win.show());
  await win.loadURL(`http://127.0.0.1:${APP_PORT}/`);
}

async function boot() {
  try {
    await initializeDatabase();
    await migrateDatabase();
    await startMedoraServer();
    await createWindow();
  } catch (error) {
    console.error(error);
    await dialog.showMessageBox({
      type: "error",
      title: "MEDORA",
      message: "MEDORA could not start.",
      detail: String(error?.stack || error),
    });
    app.quit();
  }
}

app.whenReady().then(boot);
app.on("window-all-closed", () => app.quit());
app.on("before-quit", () => {
  if (dbProcess && !dbProcess.killed) dbProcess.kill();
});
