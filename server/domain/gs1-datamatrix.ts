/**
 * GS1 DataMatrix (Egyptian drug traceability) — parse + validate.
 * Application Identifiers used: (01) GTIN-14, (17) expiry YYMMDD, (10) batch, (21) serial.
 */
export interface Gs1DataMatrix {
  gtin: string | null;
  expiry: string | null;   // ISO date
  batch: string | null;
  serial: string | null;
  raw: string;
  valid: boolean;
  errors: string[];
}

const GS = String.fromCharCode(29); // group separator

export function parseGs1DataMatrix(rawInput: string): Gs1DataMatrix {
  const raw = rawInput.trim().replace(/[∏]/g, GS); // scanners often emit a symbol for FNC1/GS
  const errors: string[] = [];
  const out: Gs1DataMatrix = { gtin: null, expiry: null, batch: null, serial: null, raw, valid: false, errors };
  if (!raw) { errors.push("empty"); out.valid = false; return out; }

  let s = raw;
  if (!s.startsWith("(01)")) {
    // tolerate "01" without parentheses
    if (/^01\d{14}/.test(s)) s = s.replace(/^01/, "(01)");
    else errors.push("missing_gtin_ai");
  }
  const gtinM = s.match(/\(01\)(\d{14})/);
  if (gtinM) {
    out.gtin = gtinM[1];
    if (!checkDigitOk(out.gtin)) errors.push("gtin_checkdigit");
  }
  const expM = s.match(/\(17\)(\d{6})/);
  if (expM) {
    const [y, m, d] = [expM[1].slice(0, 2), expM[1].slice(2, 4), expM[1].slice(4, 6)];
    out.expiry = `20${y}-${m}-${d}`;
  }
  const batchM = s.match(/\(10\)([0-9A-Za-z\-]{1,20})/);
  if (batchM) out.batch = batchM[1].split(GS)[0];
  const serM = s.match(/\(21\)([0-9A-Za-z\-]{1,20})/);
  if (serM) out.serial = serM[1].split(GS)[0];

  out.valid = Boolean(out.gtin && out.serial) && errors.length === 0;
  if (!out.serial) errors.push("missing_serial_ai21");
  if (errors.length === 0) out.valid = true;
  return out;
}

function checkDigitOk(gtin14: string): boolean {
  const digits = gtin14.split("").map(Number);
  const check = digits.pop() ?? 0;
  let sum = 0;
  digits.forEach((d, i) => (sum += i % 2 === 0 ? d * 3 : d));
  return (10 - (sum % 10)) % 10 === check;
}
