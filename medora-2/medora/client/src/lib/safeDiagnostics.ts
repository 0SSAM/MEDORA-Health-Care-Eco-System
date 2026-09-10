type DiagnosticKind = "workspace_boundary_error" | "lazy_bundle_error" | "unhandled_ui_error";

interface DebugCollectorStore {
  uiEvents?: Array<unknown>;
}

interface DebugCollector {
  store?: DebugCollectorStore;
}

interface DiagnosticWindow extends Window {
  __MEDORA_DIAGNOSTICS_INSTALLED__?: boolean;
}

declare global {
  interface Window {
    __MANUS_DEBUG_COLLECTOR__?: DebugCollector;
  }
}

const MAX_MESSAGE_LENGTH = 180;
const REDACTED_MESSAGE = "[redacted]";

function redact(value: string): string {
  return value
    .replace(/https?:\/\/\S+/gi, "[url]")
    .replace(/(?:\/|\\)[^\s]{2,}(?:\/|\\)[^\s]*/g, "[path]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [redacted]")
    .replace(/\b(?:token|secret|password|authorization|cookie)\s*[:=]\s*\S+/gi, "[secret redacted]")
    .replace(/([?&](?:access_token|id_token|token|signature|sig|key|api_key)=)[^&\s]+/gi, "$1[redacted]")
    .slice(0, MAX_MESSAGE_LENGTH);
}

export function safeDiagnosticMessage(error: unknown): string {
  if (error instanceof Error && error.message) return redact(error.message);
  if (typeof error === "string" && error.trim()) return redact(error);
  return REDACTED_MESSAGE;
}

export function safeDiagnosticDigest(error: unknown): string {
  const input = safeDiagnosticMessage(error);
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function installSafeGlobalDiagnostics(): void {
  if (typeof window === "undefined") return;
  const diagnosticWindow = window as DiagnosticWindow;
  if (diagnosticWindow.__MEDORA_DIAGNOSTICS_INSTALLED__) return;
  diagnosticWindow.__MEDORA_DIAGNOSTICS_INSTALLED__ = true;

  window.addEventListener("error", event => {
    recordSafeUiDiagnostic("unhandled_ui_error", event.error ?? event.message, "window-error");
  });
  window.addEventListener("unhandledrejection", event => {
    recordSafeUiDiagnostic("unhandled_ui_error", event.reason, "unhandled-rejection");
  });
}

export function recordSafeUiDiagnostic(
  kind: DiagnosticKind,
  error: unknown,
  context: string,
): void {
  if (typeof window === "undefined") return;

  const collector = window.__MANUS_DEBUG_COLLECTOR__;
  const events = collector?.store?.uiEvents;
  if (!Array.isArray(events)) return;

  events.push({
    timestamp: Date.now(),
    kind: "medora_diagnostic",
    url: window.location.origin + window.location.pathname,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    payload: {
      diagnosticKind: kind,
      context: context.slice(0, 80),
      errorName: error instanceof Error ? error.name.slice(0, 80) : "UnknownError",
      message: safeDiagnosticMessage(error),
      digest: safeDiagnosticDigest(error),
    },
  });

  if (events.length > 200) events.splice(0, events.length - 200);
}
