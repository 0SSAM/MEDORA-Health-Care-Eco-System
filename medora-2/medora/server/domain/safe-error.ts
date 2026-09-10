export function safeErrorLabel(error: unknown): string {
  return error instanceof Error ? error.name : "UnknownError";
}

export function safeHttpErrorLabel(status: number, statusText: string): string {
  const normalizedStatusText = statusText.replace(/[\r\n]+/g, " ").slice(0, 80);
  return `${status}${normalizedStatusText ? ` ${normalizedStatusText}` : ""}`;
}
