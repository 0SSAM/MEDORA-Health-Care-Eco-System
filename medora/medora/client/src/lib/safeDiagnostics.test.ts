import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  installSafeGlobalDiagnostics,
  recordSafeUiDiagnostic,
  safeDiagnosticDigest,
  safeDiagnosticMessage,
} from "./safeDiagnostics";

describe("safe diagnostics", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      __MANUS_DEBUG_COLLECTOR__: { store: { uiEvents: [] } },
      location: { origin: "https://medora.test", pathname: "/" },
      innerWidth: 390,
      innerHeight: 844,
      addEventListener: vi.fn(),
    });
  });

  it("redacts URLs, paths, and secret-like values from messages", () => {
    const message = safeDiagnosticMessage(
      new Error("Failed https://example.test/chunk.js /home/user/app token=abc123"),
    );
    expect(message).not.toContain("example.test");
    expect(message).not.toContain("/home/user");
    expect(message).not.toContain("abc123");
    expect(message).toContain("[url]");
  });

  it("redacts bearer tokens and sensitive query parameters", () => {
    const message = safeDiagnosticMessage(
      new Error("Authorization: Bearer abc.def-123?token=secret-value&sig=private-signature"),
    );
    expect(message).not.toContain("abc.def-123");
    expect(message).not.toContain("secret-value");
    expect(message).not.toContain("private-signature");
    expect(message).toContain("[secret redacted]");
  });

  it("produces a stable non-sensitive diagnostic digest", () => {
    expect(safeDiagnosticDigest(new Error("chunk failed"))).toBe(
      safeDiagnosticDigest(new Error("chunk failed")),
    );
    expect(safeDiagnosticDigest(new Error("chunk failed"))).not.toContain("chunk failed");
  });

  it("installs global listeners once and records redacted error events", () => {
    const listeners = new Map<string, EventListener>();
    vi.spyOn(window, "addEventListener").mockImplementation(((type: string, listener: EventListenerOrEventListenerObject) => {
      listeners.set(type, listener as EventListener);
    }) as typeof window.addEventListener);

    installSafeGlobalDiagnostics();
    installSafeGlobalDiagnostics();
    expect(listeners.size).toBe(2);

    listeners.get("unhandledrejection")?.({ reason: new Error("secret=/private/key") } as PromiseRejectionEvent);
    const events = window.__MANUS_DEBUG_COLLECTOR__?.store?.uiEvents as Array<Record<string, unknown>>;
    expect(JSON.stringify(events)).not.toContain("/private/key");
  });

  it("records only a bounded semantic event in the existing collector", () => {
    const error = new Error("Import failed at /private/secret/chunk.js");
    recordSafeUiDiagnostic("lazy_bundle_error", error, "workspace-module");

    const events = window.__MANUS_DEBUG_COLLECTOR__?.store?.uiEvents as Array<Record<string, unknown>>;
    expect(events).toHaveLength(1);
    expect(events[0]?.kind).toBe("medora_diagnostic");
    expect(events[0]?.payload).toMatchObject({
      diagnosticKind: "lazy_bundle_error",
      context: "workspace-module",
    });
    expect(JSON.stringify(events[0])).not.toContain("/private/secret");
  });
});
