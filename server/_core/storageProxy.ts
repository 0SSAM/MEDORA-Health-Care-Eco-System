import type { Express } from "express";
import { ENV } from "./env";
import { safeErrorLabel } from "../domain/safe-error";

const PUBLIC_STORAGE_KEY = /^medora-system-icon_[a-z0-9]+\.png$/i;

function isSafeStorageKey(key: string): boolean {
  return key.length > 0 && key.length <= 512 && !/[\\\0\r\n]/.test(key) && !key.split("/").some(segment => segment === ".." || segment === ".");
}

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key || !isSafeStorageKey(key)) {
      res.status(400).send("Invalid storage key");
      return;
    }

    // Sensitive clinical objects are never anonymously readable. The server
    // obtains short-lived signed URLs only after the scoped prescription gate.
    if (key.startsWith("prescriptions/") || !PUBLIC_STORAGE_KEY.test(key)) {
      res.status(404).send("Storage object not found");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(503).send("Storage proxy unavailable");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        console.error(`[StorageProxy] forge error: ${forgeResp.status}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const payload = (await forgeResp.json()) as { url?: unknown };
      if (typeof payload.url !== "string" || !/^https:\/\//i.test(payload.url)) {
        res.status(502).send("Invalid signed URL from backend");
        return;
      }

      res.set({
        "Cache-Control": "public, max-age=86400, immutable",
        "X-Content-Type-Options": "nosniff",
      });
      res.redirect(307, payload.url);
    } catch (err) {
      console.error("[StorageProxy] failed:", safeErrorLabel(err));
      res.status(502).send("Storage proxy error");
    }
  });
}

export const storageProxyInternals = { isSafeStorageKey };
