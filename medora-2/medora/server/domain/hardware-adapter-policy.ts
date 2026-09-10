export type HardwareKind = "printer" | "scanner" | "monitor";

export type HardwareTransport =
  | "browser-download"
  | "keyboard-wedge"
  | "camera"
  | "local-bridge"
  | "network-ipps"
  | "usb"
  | "bluetooth"
  | "sensor-api"
  | "cctv-api"
  | "access-control-api";

export type HardwareAdapterContext = {
  kind: HardwareKind;
  transport: HardwareTransport;
  deviceId: string;
  organizationId: number;
  branchId: number;
  jurisdictionId: number;
  protocolVerified: boolean;
  scopeVerified: boolean;
  secureChannelVerified: boolean;
  healthCheckPassed: boolean;
  operatorAuthorized: boolean;
  externalCredentialsVerified: boolean;
  monitoringGovernanceApproved?: boolean;
  monitoringPurpose?: "safety" | "asset-protection" | "environmental";
};

export type HardwareReadiness = "READY" | "BLOCKED";

const PRINTER_TRANSPORTS = new Set<HardwareTransport>([
  "browser-download",
  "local-bridge",
  "network-ipps",
  "usb",
  "bluetooth",
]);
const SCANNER_TRANSPORTS = new Set<HardwareTransport>(["keyboard-wedge", "camera", "local-bridge", "usb", "bluetooth"]);
const MONITOR_TRANSPORTS = new Set<HardwareTransport>(["sensor-api", "cctv-api", "access-control-api", "local-bridge"]);

function hasValidScope(context: HardwareAdapterContext) {
  return (
    context.deviceId.trim().length > 0 &&
    Number.isInteger(context.organizationId) &&
    context.organizationId > 0 &&
    Number.isInteger(context.branchId) &&
    context.branchId > 0 &&
    Number.isInteger(context.jurisdictionId) &&
    context.jurisdictionId > 0
  );
}

function transportAllowed(context: HardwareAdapterContext) {
  if (context.kind === "printer") return PRINTER_TRANSPORTS.has(context.transport);
  if (context.kind === "scanner") return SCANNER_TRANSPORTS.has(context.transport);
  return MONITOR_TRANSPORTS.has(context.transport);
}

export function hardwareReadiness(context: HardwareAdapterContext | null): HardwareReadiness {
  if (!context || !transportAllowed(context) || !hasValidScope(context)) return "BLOCKED";
  if (!context.protocolVerified || !context.scopeVerified || !context.healthCheckPassed || !context.operatorAuthorized) return "BLOCKED";
  if (context.kind === "monitor" && (!context.secureChannelVerified || !context.externalCredentialsVerified || !context.monitoringGovernanceApproved || !context.monitoringPurpose)) return "BLOCKED";
  if (context.kind === "printer" && context.transport !== "browser-download" && !context.secureChannelVerified) return "BLOCKED";
  if (context.kind === "scanner" && context.transport === "local-bridge" && !context.secureChannelVerified) return "BLOCKED";
  return "READY";
}

export function assertHardwareReady(context: HardwareAdapterContext | null) {
  if (hardwareReadiness(context) !== "READY") throw new Error("Hardware adapter is not ready or not safely scoped");
  return true as const;
}

export function browserCapabilityNote(kind: HardwareKind, transport: HardwareTransport) {
  if (kind === "printer" && transport === "browser-download") return "Browser-safe document/download output; direct device control is not claimed";
  if (kind === "scanner" && (transport === "keyboard-wedge" || transport === "camera")) return "Browser-safe input path; device identity and regulated submission remain separate gates";
  return "Requires a verified local bridge or external adapter with scoped credentials";
}
