import { describe, expect, it } from "vitest";

const enabled = process.env.SHOWCASE_POS_SMOKE === "1";
const baseUrl = process.env.SHOWCASE_TEST_BASE_URL ?? "http://127.0.0.1:3000";
const showcaseUsername = process.env.SHOWCASE_USERNAME ?? "test";

type StockLine = {
  productId: number;
  batchId: number;
  unit: string;
  unitPrice: number;
  quantityOnHand: number;
};

function cookieHeaders(response: Response) {
  return typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : [response.headers.get("set-cookie") ?? ""];
}

function internalSessionCookie(response: Response) {
  return cookieHeaders(response)
    .map(cookie => cookie.split(";")[0])
    .find(cookie => cookie.startsWith("aldo_internal_session="));
}

async function query<T>(path: string, input: unknown, cookie: string): Promise<T> {
  const requestInput = encodeURIComponent(JSON.stringify({ 0: { json: input } }));
  const response = await fetch(`${baseUrl}/api/trpc/${path}?batch=1&input=${requestInput}`, { headers: { cookie } });
  expect(response.status).toBe(200);
  const payload = await response.json() as Array<{ result?: { data?: { json?: T }; error?: unknown } }>;
  expect(payload[0]?.result?.data?.json).toBeDefined();
  return payload[0]!.result!.data!.json!;
}

async function mutate<T>(path: string, input: unknown, cookie: string): Promise<T> {
  const response = await fetch(`${baseUrl}/api/trpc/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ json: input }),
  });
  expect(response.status).toBe(200);
  const payload = await response.json() as { result?: { data?: { json?: T } }; error?: { json?: { message?: string } } };
  expect(payload.error?.json?.message).toBeUndefined();
  expect(payload.result?.data?.json).toBeDefined();
  return payload.result!.data!.json!;
}

describe.skipIf(!enabled)("isolated showcase POS transaction smoke", () => {
  it("commits one synthetic item and exposes its scoped trial invoice", async () => {
    const password = process.env.SHOWCASE_TEST_PASSWORD;
    expect(password).toBeTruthy();
    const login = await fetch(`${baseUrl}/api/trpc/auth.internalLogin`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ json: { username: showcaseUsername, password } }),
    });
    expect(login.status).toBe(200);
    const sessionCookie = internalSessionCookie(login);
    expect(sessionCookie).toMatch(/^aldo_internal_session=/);

    const stock = await query<StockLine[]>("erp.pos.availableStock", { branchId: 1, jurisdictionId: 1, query: "" }, sessionCookie!);
    const line = stock.find(item => item.quantityOnHand >= 1);
    expect(line).toBeDefined();

    const invoiceNumber = `MEDORA-UAT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const result = await mutate<{ saleId: number; jurisdictionId: number; status: string }>("erp.pos.commitShowcaseSale", {
      branchId: 1,
      invoiceNumber,
      paymentMethod: "cash",
      discountAmount: 0,
      items: [{ productId: line!.productId, batchId: line!.batchId, quantity: 1, unit: line!.unit, unitPrice: line!.unitPrice }],
    }, sessionCookie!);
    expect(result.status).toBe("COMMITTED");
    expect(result.jurisdictionId).toBe(1);

    const invoices = await query<Array<{ invoiceNumber: string; saleStatus: string }>>("erp.pos.demoTrialInvoices", { branchId: 1, jurisdictionId: 1, query: invoiceNumber, limit: 10 }, sessionCookie!);
    expect(invoices).toEqual(expect.arrayContaining([expect.objectContaining({ invoiceNumber, saleStatus: "completed" })]));
  }, 30_000);
});
