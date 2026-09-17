import type { Request, Response } from "express";
import { getDb } from "../db";
import { sdk } from "../_core/sdk";

export function safeLoginHealthError(_error: unknown) {
  return { error: "login-health-check-failed" } as const;
}

export async function loginHealthHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });

    const db = await getDb();
    if (!db) return res.status(503).json({ ok: false, error: "database-unavailable" });

    return res.status(200).json({
      ok: true,
      taskUid: user.taskUid,
      checks: {
        database: "ok",
        credentialPath: "not-invoked",
        scopePath: "not-invoked",
        passwordExposure: "none",
        loginMutation: "not_attempted",
      },
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json(safeLoginHealthError(error));
  }
}
