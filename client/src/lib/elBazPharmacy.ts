export const EL_BAZ_PHARMACY = {
  key: "el-baz-pharmacy",
  nameEn: "El-Baz Pharmacy",
  nameAr: "صيدلية الباز",
  manager: "Dr. Nouran Tarek",
  addressAr: "المنصوره، ميدان مشعل، بجوار كشري جدو",
  addressEn: "Mansoura, Mishaal Square, next to Koshary Gedo",
  landline: "0502243574",
  whatsapp: "01040716080",
  logo: "/branding/el-baz-pharmacy-logo.svg",
  background: "/branding/el-baz-pharmacy-background.svg",
  palette: {
    ink: "#0d1b2a",
    teal: "#0f766e",
    mist: "#e8fffb",
    paper: "#f7fbfc",
    silver: "#94a3b8",
  },
  receipt: {
    title: "El-Baz Pharmacy | صيدلية الباز",
    footer: "Thank you for trusting El-Baz Pharmacy | شكرًا لثقتكم في صيدلية الباز",
    contact: "0502243574 · WhatsApp 01040716080",
  },
} as const;

export function elBazBarcodeSeed(value: string): string {
  return value.replace(/[^0-9]/g, "").slice(0, 13).padStart(13, "0");
}

/** Deterministic visual barcode for UI labels; real product GS1/EDA codes remain source-controlled. */
export function barcodeBars(value: string): number[] {
  const seed = elBazBarcodeSeed(value);
  const bars: number[] = [1, 1, 1, 1];
  for (const char of seed) {
    const n = Number(char);
    bars.push(1, (n % 3) + 1, 1, ((n + 1) % 4) + 1);
  }
  bars.push(1, 1, 1);
  return bars;
}
