export type HardwareTransport =
  | "browser-download"
  | "local-bridge"
  | "network-ipps"
  | "usb"
  | "bluetooth";

export type HardwareActivationState = "disabled" | "pending-approval" | "approved";

export type PrinterCapability = {
  id: string;
  name: string;
  transport: HardwareTransport;
  media: "receipt-58mm" | "receipt-80mm" | "label-zpl" | "office-a4";
  state: HardwareActivationState;
};

export type ScannerCapability = {
  id: string;
  name: string;
  transport: "camera" | "keyboard-wedge" | "local-bridge" | "usb" | "bluetooth";
  symbologies: Array<"barcode" | "data-matrix" | "qr">;
  state: HardwareActivationState;
};

export type ReceiptPrintRequest = {
  receiptId: string;
  scope: { organizationId: number; branchId: number; jurisdictionId: number };
  content: string;
  media: PrinterCapability["media"];
};

export type HardwareAdapterResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: "disabled" | "not-approved" | "unsupported" | "invalid-request"; message: string };

export const productionHardwarePolicy = {
  allowNetworkEndpointsFromClient: false,
  allowDirectUsbFromBrowser: false,
  allowDirectBluetoothFromBrowser: false,
  requireApprovedAdapter: true,
  preserveBrowserFallback: true,
} as const;

export function validateReceiptPrintRequest(request: ReceiptPrintRequest): HardwareAdapterResult<ReceiptPrintRequest> {
  if (!request.receiptId.trim() || !request.content.trim()) {
    return { ok: false, code: "invalid-request", message: "Receipt content and identifier are required." };
  }
  if (!request.scope.organizationId || !request.scope.branchId || !request.scope.jurisdictionId) {
    return { ok: false, code: "invalid-request", message: "A complete organization scope is required." };
  }
  return { ok: true, value: request };
}

export function resolvePrinterPath(capability: PrinterCapability | undefined): HardwareAdapterResult<PrinterCapability> {
  if (!capability) {
    return { ok: false, code: "disabled", message: "No printer adapter is configured." };
  }
  if (capability.state === "disabled") {
    return { ok: false, code: "disabled", message: "The printer adapter is disabled." };
  }
  if (productionHardwarePolicy.requireApprovedAdapter && capability.state !== "approved") {
    return { ok: false, code: "not-approved", message: "The printer adapter requires explicit production approval." };
  }
  if (capability.transport === "usb" || capability.transport === "bluetooth") {
    return { ok: false, code: "unsupported", message: "Direct browser USB/Bluetooth printing is not enabled; use an approved bridge." };
  }
  return { ok: true, value: capability };
}

export function resolveScannerPath(capability: ScannerCapability | undefined): HardwareAdapterResult<ScannerCapability> {
  if (!capability) {
    return { ok: false, code: "disabled", message: "No scanner adapter is configured." };
  }
  if (capability.state === "disabled") {
    return { ok: false, code: "disabled", message: "The scanner adapter is disabled." };
  }
  if (capability.state !== "approved") {
    return { ok: false, code: "not-approved", message: "The scanner adapter requires explicit production approval." };
  }
  return { ok: true, value: capability };
}

export function getBrowserFallbacks(): string[] {
  return ["window.print / PDF download", "camera BarcodeDetector or manual entry", "keyboard-wedge barcode input"];
}
