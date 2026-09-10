import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { scheduledCallbackRateLimitOptions } from "./scheduled-rate-limit";

describe("scheduled callback rate-limit boundary", () => {
  it("uses a bounded one-minute limiter with standards-based headers", () => {
    expect(scheduledCallbackRateLimitOptions).toMatchObject({
      windowMs: 60_000,
      limit: 30,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Too many scheduled callback requests" },
    });
  });

  it("places the standard limiter before every authenticated Heartbeat callback", async () => {
    const source = await readFile(new URL("./index.ts", import.meta.url), "utf8");

    expect(source).toContain('app.post("/api/scheduled/inventory-alerts", scheduledCallbackRateLimit, inventoryAlertHandler);');
    expect(source).toContain('app.post("/api/scheduled/report-execution", scheduledCallbackRateLimit, reportExecutionHandler);');
    expect(source).toContain('app.post("/api/scheduled/backup", scheduledCallbackRateLimit, backupHandler);');
  });
});
