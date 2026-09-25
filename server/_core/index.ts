import "./wasmer-db-env";
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { createServer } from "http";
import net from "net";
import { rateLimit } from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { prepareRuntimeEnvironment, stopEmbeddedDatabase } from "./embedded-database";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { inventoryAlertHandler } from "../scheduled/inventory";
import { reportExecutionHandler } from "../scheduled/reports";
import { backupHandler } from "../scheduled/backups";
import { createSecurityMiddleware } from "./security";
import { attachRequestCookies } from "./request-cookies";
import { registerPublicReadinessRoute } from "./readiness";
import { scheduledCallbackRateLimitOptions } from "./scheduled-rate-limit";
import { webhookRouter } from "../channels/webhooks";

const serverStartedAt = Date.now();

function readAppVersion() {
  try {
    const packageJsonPath = path.resolve(import.meta.dirname, "..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as { version?: string };
    return packageJson.version ?? "0.0.0";
  } catch {
    return "unknown";
  }
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();

    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Zero-setup database runtime: boots (or reuses) the embedded MySQL server
  // when DATABASE_URL is not configured, applies migrations, and seeds
  // first-run data. With DATABASE_URL configured this only ensures a stable
  // local JWT secret and returns immediately.
  const databaseInfo = await prepareRuntimeEnvironment();
  if (databaseInfo.mode === "embedded") {
    console.log(
      `[medora] using the embedded database (port ${databaseInfo.port}); data directory: ${databaseInfo.dataDir}`
    );
  }

  const app = express();
  app.use("/api/channels", webhookRouter());
  const server = createServer(app);
  const scheduledCallbackRateLimit = rateLimit(scheduledCallbackRateLimitOptions);
  const apiRateLimit = rateLimit({
    windowMs: 60_000,
    limit: 600,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many API requests" },
  });
  app.disable("x-powered-by");
  // The managed edge terminates TLS before forwarding one hop to this process.
  // Trust exactly that hop so Express resolves the browser-visible HTTPS origin
  // for CSRF/origin checks; do not trust an unbounded forwarding chain.
  app.set("trust proxy", 1);
  app.use(createSecurityMiddleware());
  // Bounded request parsing: upload handlers additionally validate MIME, scope,
  // and content before persistence. Large payloads must use approved object storage.
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  // Internal employee sessions use a distinct, server-backed cookie. Parse it
  // before tRPC creates its context so the request immediately following a
  // successful internalLogin can resolve the authenticated employee.
  app.use((req, _res, next) => {
    attachRequestCookies(req);
    next();
  });
  registerPublicReadinessRoute(app);
  app.all(/^\/demo(?:\/.*)?$/, (_req, res) => {
    res.status(404).type("text/plain; charset=utf-8").send("Not Found");
  });
  app.get("/api/health", (_req, res) => {
    res.status(200).type("application/json; charset=utf-8").send({
      status: "ok",
      version: readAppVersion(),
      uptimeSeconds: Math.max(0, Math.floor((Date.now() - serverStartedAt) / 1000)),
      timestamp: new Date().toISOString(),
    });
  });
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API: all procedures are bounded by the API-wide per-IP limiter.
  app.use(
    "/api/trpc",
    apiRateLimit,
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Heartbeat callback: production cron only; handler authenticates task UID.
  app.post("/api/scheduled/inventory-alerts", scheduledCallbackRateLimit, inventoryAlertHandler);
  app.post("/api/scheduled/report-execution", scheduledCallbackRateLimit, reportExecutionHandler);
  app.post("/api/scheduled/backup", scheduledCallbackRateLimit, backupHandler);
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[medora] received ${signal}, shutting down…`);
  await stopEmbeddedDatabase();
  process.exit(0);
}
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("exit", () => {
  void stopEmbeddedDatabase();
});

startServer().catch(async error => {
  console.error(error);
  await stopEmbeddedDatabase();
  process.exit(1);
});
