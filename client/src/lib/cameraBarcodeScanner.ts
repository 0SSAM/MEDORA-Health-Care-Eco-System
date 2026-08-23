export type CameraScanStatus = "idle" | "requesting" | "scanning" | "unsupported" | "insecure" | "denied" | "error" | "success";

export type CameraBarcodeResult = {
  rawValue: string;
  format: string;
};

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<CameraBarcodeResult[]>;
};

type BarcodeDetectorConstructorLike = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

type BarcodeDetectorWindow = Window & typeof globalThis & {
  BarcodeDetector?: BarcodeDetectorConstructorLike;
};

export const CAMERA_FORMATS = [
  "aztec",
  "codabar",
  "code_128",
  "code_39",
  "code_93",
  "data_matrix",
  "ean_13",
  "ean_8",
  "itf",
  "pdf417",
  "qr_code",
  "upc_a",
  "upc_e",
] as const;

export function isCameraBarcodeSupported(): boolean {
  return typeof window !== "undefined" && Boolean((window as BarcodeDetectorWindow).BarcodeDetector);
}

export function cameraUnavailableReason(): "insecure" | "unsupported" | null {
  if (typeof window === "undefined") return "unsupported";
  if (!window.isSecureContext) return "insecure";
  if (!navigator.mediaDevices?.getUserMedia) return "unsupported";
  if (!isCameraBarcodeSupported()) return "unsupported";
  return null;
}

export async function requestRearCamera(): Promise<MediaStream> {
  const reason = cameraUnavailableReason();
  if (reason) throw new Error(reason);
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
  });
}

export function createCameraDetector(): BarcodeDetectorLike {
  const Detector = (window as BarcodeDetectorWindow).BarcodeDetector;
  if (!Detector) throw new Error("unsupported");
  return new Detector({ formats: [...CAMERA_FORMATS] });
}

export function stopCameraStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach(track => track.stop());
}

export function cameraResultToRaw(result: CameraBarcodeResult): string | null {
  const raw = result.rawValue;
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}
