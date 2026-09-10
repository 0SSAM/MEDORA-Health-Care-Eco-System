import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

const workerPath = fileURLToPath(new URL("../../public/sw.js", import.meta.url));

function loadFetchHandler() {
  let fetchHandler: ((event: { request: Request; respondWith: (response: Promise<unknown>) => void }) => void) | undefined;
  const self = {
    addEventListener: (type: string, handler: typeof fetchHandler) => {
      if (type === "fetch") fetchHandler = handler;
    },
    clients: { claim: vi.fn() },
    navigator: { onLine: true },
    skipWaiting: vi.fn(),
  };

  vm.runInNewContext(readFileSync(workerPath, "utf8"), {
    URL,
    Response,
    caches: { delete: vi.fn(), match: vi.fn(), open: vi.fn() },
    fetch: vi.fn(() => Promise.resolve(new Response("ok"))),
    Promise,
    self,
  });

  if (!fetchHandler) throw new Error("Service worker did not register a fetch handler");
  return fetchHandler;
}

describe("service worker API isolation policy", () => {
  it("does not replace a tRPC request with the cached application shell", () => {
    const handler = loadFetchHandler();
    const respondWith = vi.fn();

    handler({
      request: new Request("https://medora.example/api/trpc/erp.pos.availableStock?batch=1", { method: "GET" }),
      respondWith,
    });

    expect(respondWith).not.toHaveBeenCalled();
  });

  it("retains shell fallback only for navigation requests", () => {
    const handler = loadFetchHandler();
    const respondWith = vi.fn();
    const request = new Request("https://medora.example/workspace", { method: "GET" });
    Object.defineProperty(request, "mode", { value: "navigate" });

    handler({ request, respondWith });

    expect(respondWith).toHaveBeenCalledOnce();
  });
});
