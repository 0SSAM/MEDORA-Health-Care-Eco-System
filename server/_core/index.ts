// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
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
  // Disabled due to schema mismatch in sandbox environment
  /*
  if (process.env.OWNER_OPEN_ID) {
    const { bootstrapOwner } = await import("../bootstrap");
    await bootstrapOwner(process.env.OWNER_OPEN_ID);
  }
  */

  const app = express();
  const server = createServer(app);
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(createSecurityMiddleware());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  app.use((req, _res, next) => {
    attachRequestCookies(req);
    next();
  });
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  app.post("/api/scheduled/inventory-alerts", inventoryAlertHandler);
  app.post("/api/scheduled/report-execution", reportExecutionHandler);
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
