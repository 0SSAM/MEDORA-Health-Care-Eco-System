export type ScanSymbology = "barcode" | "data-matrix" | "unknown";
export type ScanSource = "hardware" | "simulated" | "camera" | "manual";

export type ScanPayload = {
  raw: string;
  symbology: ScanSymbology;
  source: ScanSource;
  capturedAt: string;
};

/**
 * Keeps the decoded payload lossless. Do not trim, parse, or truncate raw data
 * here; regulated consumers can validate supported fields separately.
 */
export function createScanPayload(raw: string, options: { symbology?: ScanSymbology; source: ScanSource; capturedAt?: string }): ScanPayload | null {
  if (!raw || raw.length === 0) return null;
  return {
    raw,
    symbology: options.symbology ?? "unknown",
    source: options.source,
    capturedAt: options.capturedAt ?? new Date().toISOString(),
  };
}

export function classifyScan(raw: string): ScanSymbology {
  if (raw.includes("\u001d") || raw.startsWith("]d2")) return "data-matrix";
  if (/^[0-9A-Za-z\-._/]+$/.test(raw)) return "barcode";
  return "unknown";
}

export function scanLookupCandidates(payload: ScanPayload): string[] {
  // Exact raw value always comes first. GS1/Data Matrix separators are retained
  // in payload.raw; derived candidates are only lookup conveniences.
  const candidates = [payload.raw];
  const withoutScannerPrefix = payload.raw.replace(/^\]d[12]/, "");
  if (withoutScannerPrefix !== payload.raw) candidates.push(withoutScannerPrefix);

  // Data Matrix can contain GS1 separators and regulated application fields.
  // Its raw payload and the existing scanner-prefix candidate are deliberately
  // the only lookup values: no whitespace, case, or structural rewrite is safe.
  if (payload.symbology === "data-matrix") return candidates;

  // Ordinary barcode/SKU scans sometimes include keyboard-wedge framing
  // whitespace or a casing difference. These are *secondary* client lookup
  // conveniences only: raw input is still preserved, shown, and queried.
  const trimmed = withoutScannerPrefix.trim();
  if (trimmed && trimmed !== withoutScannerPrefix) candidates.push(trimmed);
  const compact = trimmed.replace(/[\t\r\n ]+/g, "");
  if (compact && /^[0-9A-Za-z._/-]+$/.test(compact)) {
    if (compact !== trimmed) candidates.push(compact);
    const upper = compact.toUpperCase();
    const lower = compact.toLowerCase();
    if (upper !== compact) candidates.push(upper);
    if (lower !== compact) candidates.push(lower);
  }
  return candidates.filter((candidate, index) => candidates.indexOf(candidate) === index);
}

export type KeyboardWedgeEvent = { key: string; at: number };

/**
 * Accepts only rapid keyboard-wedge sequences and returns the lossless payload.
 * Normal human typing is rejected by the inter-character threshold.
 */
export function parseKeyboardWedgeSequence(events: KeyboardWedgeEvent[], options: { maxInterCharacterMs?: number; minLength?: number } = {}): string | null {
  const maxInterCharacterMs = options.maxInterCharacterMs ?? 55;
  const minLength = options.minLength ?? 4;
  if (events.length < minLength) return null;
  for (let index = 1; index < events.length; index += 1) if (events[index].at - events[index - 1].at > maxInterCharacterMs) return null;
  const payload = events.map(event => event.key).join("");
  return payload.length >= minLength ? payload : null;
}
