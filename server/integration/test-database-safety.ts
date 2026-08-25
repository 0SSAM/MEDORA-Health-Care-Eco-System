const PRODUCTION_HOST_MARKERS = ["prod", "production", "live", "primary"];

export function isIsolatedTestDatabaseUrl(url: string | undefined, isolationMarker: string | undefined): boolean {
  if (isolationMarker !== "true" || !url) return false;
  try {
    const parsed = new URL(url);
    if (!["mysql:", "mysql2:", "mariadb:"].includes(parsed.protocol)) return false;
    const host = parsed.hostname.toLowerCase();
    return !PRODUCTION_HOST_MARKERS.some(marker => host === marker || host.startsWith(`${marker}.`) || host.startsWith(`${marker}-`) || host.includes(`-${marker}-`));
  } catch {
    return false;
  }
}
