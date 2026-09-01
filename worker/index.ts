import { Hono } from "hono";
import { cors } from "hono/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../server/_core/router";
import { createContext } from "./context";

export type Env = {
  DB: D1Database;
  ASSETS: Fetcher;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({
  origin: ["*"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.get("/healthz", (c) => c.json({ ok: true, service: "medora" }));

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: ({ req }) => createContext({ req, env: c.env }),
  });
});

app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
