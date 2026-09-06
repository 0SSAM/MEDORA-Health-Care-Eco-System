/**
 * webhooks.ts — Express webhook endpoints for WhatsApp Cloud API + Twilio Programmable Voice.
 * Provider callbacks are authenticated before any database mutation.
 */
import express, { Router, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import { getRawPool } from "./db";
import { parseWebhookPayload, verifyWebhook, verifyWebhookSignature } from "./whatsapp";
import { parseStatusCallback, verifyTwilioSignature } from "./twilio";

const DEFAULT_ORG = Number(process.env.MEDORA_DEFAULT_ORG_ID ?? 1);

// Webhooks are public internet-facing endpoints. Keep the limit high enough for
// legitimate provider bursts while preventing unbounded request flooding.
const webhookRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

type RawBodyRequest = Request & { rawBody?: Buffer };

function twilioRequestUrl(req: Request): string {
  const protocol = String(req.get("x-forwarded-proto") ?? req.protocol).split(",")[0].trim();
  return `${protocol}://${req.get("host") ?? ""}${req.originalUrl}`;
}

function verifyTwilioRequest(req: Request, params: Record<string, string>): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN ?? "";
  const signature = req.get("X-Twilio-Signature");
  if (!authToken || !signature) return false;
  const expectedAccountSid = process.env.TWILIO_ACCOUNT_SID;
  if (expectedAccountSid && params.AccountSid && params.AccountSid !== expectedAccountSid) return false;
  return verifyTwilioSignature(authToken, twilioRequestUrl(req), params, signature);
}

export function webhookRouter(): Router {
  const r = Router();
  r.use(webhookRateLimit);

  r.get("/whatsapp/webhook", (req: Request, res: Response) => {
    const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? "";
    const challenge = verifyWebhook(req.query as Record<string, unknown>, expected);
    if (challenge === null) {
      res.status(403).send("Verification failed");
      return;
    }
    if (!/^[A-Za-z0-9._~:/?[\]@!$'()*+,;=% -]{1,256}$/.test(challenge)) {
      res.status(400).send("Invalid verification challenge");
      return;
    }
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
    res.status(200).end(challenge);
  });

  r.post(
    "/whatsapp/webhook",
    express.json({
      verify: (req, _res, buf) => {
        (req as RawBodyRequest).rawBody = Buffer.from(buf);
      },
    }),
    async (req: Request, res: Response) => {
      try {
        const appSecret = process.env.WHATSAPP_APP_SECRET ?? "";
        const rawBody = (req as RawBodyRequest).rawBody;
        if (!appSecret || !rawBody || !verifyWebhookSignature(appSecret, rawBody, req.get("X-Hub-Signature-256"))) {
          res.status(403).send("Webhook signature verification failed");
          return;
        }
        const { messages, statuses } = parseWebhookPayload(req.body);
        const pool = getRawPool();
        for (const status of statuses) {
          // Provider-controlled message IDs are never a tenant boundary by themselves.
          await pool.query(
            "UPDATE channel_messages SET status=? WHERE organizationId=? AND platformMessageId=?",
            [status.status, DEFAULT_ORG, status.id],
          );
        }
        for (const m of messages) {
          const to = m.displayPhoneNumber || m.phoneNumberId;
          const [rows] = await pool.query(
            "INSERT INTO channel_messages (organizationId, channel, direction, platformMessageId, fromNumber, toNumber, body, status) VALUES (?,?,?,?,?,?,?,?)",
            [DEFAULT_ORG, "whatsapp", "inbound", m.id, m.from, to, m.body, "received"],
          );
          const messageId = Number((rows as { insertId: number }).insertId);
          const [cust] = await pool.query(
            "SELECT id, organizationId, branchId, jurisdictionId FROM customer_profiles WHERE organizationId=? AND phone=? LIMIT 1",
            [DEFAULT_ORG, m.from],
          );
          const customer = (cust as Array<{ id: number; organizationId: number; branchId: number | null; jurisdictionId: number | null }>)[0];
          const subject = m.body.length > 160 ? `${m.body.slice(0, 157)}...` : m.body || "WhatsApp message";
          const disposition = "inbound_whatsapp";
          const createdByUserId = Number(process.env.MEDORA_SYSTEM_USER_ID ?? 1);
          const [ticket] = await pool.query(
            "INSERT INTO call_tickets (organizationId, branchId, customerId, channel, direction, subject, priority, status, disposition, createdByUserId) VALUES (?,?,?,?,?,?,?,?,?,?)",
            [customer?.organizationId ?? DEFAULT_ORG, customer?.branchId ?? null, customer?.id ?? null, "whatsapp", "inbound", subject, "normal", "open", disposition, createdByUserId],
          );
          const ticketId = Number((ticket as { insertId: number }).insertId);
          await pool.query("UPDATE channel_messages SET ticketId=? WHERE organizationId=? AND id=?", [ticketId, DEFAULT_ORG, messageId]);
        }
        res.sendStatus(200);
      } catch (err) {
        console.error("[whatsapp-webhook]", err);
        res.sendStatus(500);
      }
    },
  );

  r.post("/twilio/voice", express.urlencoded({ extended: true }), (req: Request, res: Response) => {
    const params = Object.fromEntries(Object.entries(req.body as Record<string, unknown>).map(([key, value]) => [key, Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "")]));
    if (!verifyTwilioRequest(req, params)) {
      res.status(403).send("Webhook signature verification failed");
      return;
    }
    res.type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<Response><Say language="ar">مرحبًا بك في ميدورا للرعاية الصحية. سيتم تحويل مكالمتك إلى الفريق المتاح.</Say><Queue>medora_support</Queue></Response>`);
  });

  r.post("/twilio/status", express.urlencoded({ extended: true }), async (req: Request, res: Response) => {
    try {
      const params = Object.fromEntries(Object.entries(req.body as Record<string, unknown>).map(([key, value]) => [key, Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "")]));
      if (!verifyTwilioRequest(req, params)) {
        res.status(403).send("Webhook signature verification failed");
        return;
      }
      const cb = parseStatusCallback(req.body as Record<string, string | string[] | undefined>);
      const pool = getRawPool();
      await pool.query(
        "INSERT INTO channel_calls (organizationId, platformCallSid, direction, fromNumber, toNumber, status, durationSeconds, recordingUrl) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE status=VALUES(status), durationSeconds=VALUES(durationSeconds), recordingUrl=VALUES(recordingUrl)",
        [DEFAULT_ORG, cb.callSid, cb.direction.startsWith("in") ? "inbound" : "outbound", cb.from, cb.to, cb.callStatus, cb.callDuration ? Number(cb.callDuration) : null, cb.recordingUrl || null],
      );
      const [tickets] = await pool.query(
        "SELECT id FROM call_tickets WHERE organizationId=? AND subject LIKE ? ORDER BY id DESC LIMIT 1",
        [DEFAULT_ORG, `%${cb.to}%`],
      );
      if ((tickets as Array<{ id: number }>).length && cb.callStatus) {
        const statusMap: Record<string, string> = { completed: "resolved", busy: "pending", "no-answer": "pending", failed: "pending", canceled: "pending" };
        const next = statusMap[cb.callStatus] ?? "pending";
        await pool.query("UPDATE call_tickets SET status=? WHERE organizationId=? AND id=?", [next, DEFAULT_ORG, (tickets as Array<{ id: number }>)[0].id]);
      }
      res.sendStatus(200);
    } catch (err) {
      console.error("[twilio-status]", err);
      res.sendStatus(500);
    }
  });

  return r;
}
