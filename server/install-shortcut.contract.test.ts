import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const banner = readFileSync(resolve(root, "client/src/components/InstallShortcutBanner.tsx"), "utf8");
const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");
const manifest = readFileSync(resolve(root, "client/public/manifest.webmanifest"), "utf8");
const index = readFileSync(resolve(root, "client/index.html"), "utf8");

describe("MEDORA install shortcut contracts", () => {
  it("shows a native prompt when available and fallback instructions otherwise", () => {
    expect(banner).toContain("beforeinstallprompt");
    expect(banner).toContain("prompt()");
    expect(banner).toContain('t("install.showMethod")');
    expect(banner).toContain('t("install.ios")');
    expect(banner).toContain('t("install.desktop")');
  });

  it("avoids redundant prompts after standalone installation or session dismissal", () => {
    expect(banner).toContain("display-mode: standalone");
    expect(banner).toContain("appinstalled");
    expect(banner).toContain("medora-install-dismissed");
    expect(banner).toContain("sessionStorage");
  });

  it("is mounted globally and has installable metadata", () => {
    expect(app).toContain("InstallShortcutBanner");
    expect(index).toContain('rel="manifest"');
    expect(index).toContain('rel="apple-touch-icon"');
    expect(manifest).toContain('"display": "standalone"');
    expect(manifest).toContain('"shortcuts"');
    expect(manifest).toContain('"url": "/pos"');
  });
});
