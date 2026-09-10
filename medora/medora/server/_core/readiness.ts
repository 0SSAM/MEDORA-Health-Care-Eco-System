import type { Express } from "express";

/**
 * Deliberately minimal process readiness response for managed infrastructure.
 * It must never expose tenant, database, authentication, deployment, or secret data.
 */
export function publicReadinessPayload() {
  return { status: "ok" } as const;
}

export function registerPublicReadinessRoute(app: Express) {
  app.get("/healthz", (_req, res) => {
    res
      .status(200)
      .set("Cache-Control", "no-store")
      .type("application/json")
      .json(publicReadinessPayload());
  });
}
