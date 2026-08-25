import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { recordAuthenticationEvent } from "../db";

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

const blockShowcaseMutations = t.middleware(async opts => {
  const showcaseSession = opts.ctx.internalSession?.session;
  if (opts.type === "mutation" && showcaseSession?.sessionMode === "showcase") {
    await recordAuthenticationEvent({
      userId: opts.ctx.user?.id,
      username: opts.ctx.user?.email,
      organizationId: showcaseSession.organizationId,
      branchId: showcaseSession.branchId,
      jurisdictionId: showcaseSession.jurisdictionId,
      eventType: "showcase_mutation_simulated",
      source: "internal",
      requestId: String(opts.ctx.req.headers["x-request-id"] ?? "showcase-mutation"),
    });
    throw new TRPCError({ code: "FORBIDDEN", message: "هذه العملية محاكاة فقط ولا تُحفظ من حساب العرض." });
  }
  return opts.next();
});

export const protectedProcedure = t.procedure.use(requireUser).use(blockShowcaseMutations);

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
).use(blockShowcaseMutations);
