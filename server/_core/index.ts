import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { inventoryAlertHandler } from "../scheduled/inventory";
import { reportExecutionHandler } from "../scheduled/reports";
import { createSecurityMiddleware } from "./security";
import { attachRequestCookies } from "./request-cookies";
import { bootstrapSystem } from "../bootstrap";

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
  // Automated System Bootstrap & Admin Provisioning
  await bootstrapSystem();

  const app = express();
  const server = createServer(app);
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
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Heartbeat callback: production cron only; handler authenticates task UID.
  app.post("/api/scheduled/inventory-alerts", inventoryAlertHandler);
  app.post("/api/scheduled/report-execution", reportExecutionHandler);
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

startServer().catch(console.error);
