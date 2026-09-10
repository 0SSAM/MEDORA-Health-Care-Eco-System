import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { hasCurrentNdaAcceptance } from "../db";
import { MEDORA_NDA_HASH, MEDORA_NDA_VERSION } from "../domain/nda-policy";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

const requireCurrentNda = t.middleware(async opts => {
  const user = opts.ctx.user;
  if (!user || !(await hasCurrentNdaAcceptance(user.id, MEDORA_NDA_VERSION, MEDORA_NDA_HASH))) {
    throw new TRPCError({ code: "FORBIDDEN", message: "NDA_ACCEPTANCE_REQUIRED" });
  }
  return opts.next();
});

export const authenticatedProcedure = t.procedure.use(requireUser);
export const protectedProcedure = authenticatedProcedure.use(requireCurrentNda);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
).use(requireCurrentNda);
