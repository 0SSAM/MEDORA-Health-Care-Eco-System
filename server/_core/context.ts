import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getInternalSession } from "../db";
import { INTERNAL_SESSION_COOKIE } from "../domain/internal-auth";
import type { InternalSession } from "../../drizzle/schema";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  internalSession: { session: InternalSession; user: User } | null;

};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let internalSession: { session: InternalSession; user: User } | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  if (!user) {
    const internalToken = opts.req.cookies?.[INTERNAL_SESSION_COOKIE];
    if (internalToken) {
      internalSession = (await getInternalSession(internalToken)) ?? null;
      if (internalSession) user = internalSession.user;
    }
  }


  return {
    req: opts.req,
    res: opts.res,
    user,
    internalSession,
  };
}
