import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import type { Env } from "./index";

export async function createContext({ req, env }: { req: Request; env: Env }) {
  const db = drizzle(env.DB, { schema });
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return { db, env, req, token };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
