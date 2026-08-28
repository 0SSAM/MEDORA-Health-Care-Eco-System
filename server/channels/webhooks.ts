/**
 * webhooks.ts — Express webhook endpoints for WhatsApp Cloud API + Twilio Programmable Voice.
 * Verified flows: WhatsApp GET verify (hub.mode/verify_token/challenge) + POST inbound; Twilio status callback.
 */
import express, { Router, type Request, type Response } from "express";
import { getRawPool } from "./db";
import { parseWebhookPayload, verifyWebhook } from "./whatsapp";
import { parseStatusCallback } from "./twilio";

const DEFAULT_ORG = Number(process.env.MEDORA_DEFAULT_ORG_ID ?? 1);

export function webhookRouter(): Router {
  const r = Router();

  r.get("/whatsapp/webhook", (req: Request, res: Response) => {
    const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? "";
    const challenge = verifyWebhook(req.query as Record<string, unknown>, expected);
    if (challenge === null) {
      res.status(403).send("Verification failed");
      return;
    }
    res.type("text/plain").send(challenge);
  });

  r.post("/whatsapp/webhook", express.json(), async (req: Request, res: Response) => {
    try {
      const { messages, statuses } = parseWebhookPayload(req.body);
      const pool = getRawPool();
      for (const status of statuses) {
        await pool.query("UPDATE channel_messages SET status=? WHERE platformMessageId=?", [status.status, status.id]);
      }
      for (const m of messages) {
        const to = m.displayPhoneNumber || m.phoneNumberId;
        const [rows] = await pool.query(
          "INSERT INTO channel_messages (organizationId, channel, direction, platformMessageId, fromNumber, toNumber, body, status) VALUES (?,?,?,?,?,?,?,?)",
          [DEFAULT_ORG, "whatsapp", "inbound", m.id, m.from, to, m.body, "received"],
        );
        const messageId = Number((rows as { insertId: number }).insertId);
        const [cust] = await pool.query(
          "SELECT id, organizationId, branchId, jurisdictionId FROM customer_profiles WHERE phone=? LIMIT 1",
          [m.from],
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
        await pool.query("UPDATE channel_messages SET ticketId=? WHERE id=?", [ticketId, messageId]);
      }
      res.sendStatus(200);
    } catch (err) {
      console.error("[whatsapp-webhook]", err);
      res.sendStatus(500);
    }
  });

  r.post("/twilio/voice", express.urlencoded({ extended: true }), (_req: Request, res: Response) => {
    res.type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<Response><Say language="ar">مرحبًا بك في ميدورا للرعاية الصحية. سيتم تحويل مكالمتك إلى الفريق المتاح.</Say><Queue>medora_support</Queue></Response>`);
  });

  r.post("/twilio/status", express.urlencoded({ extended: true }), async (req: Request, res: Response) => {
    try {
      const cb = parseStatusCallback(req.body as Record<string, string | string[] | undefined>);
      const pool = getRawPool();
      await pool.query(
        "INSERT INTO channel_calls (organizationId, platformCallSid, direction, fromNumber, toNumber, status, durationSeconds, recordingUrl) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE status=VALUES(status), durationSeconds=VALUES(durationSeconds), recordingUrl=VALUES(recordingUrl)",
        [DEFAULT_ORG, cb.callSid, cb.direction.startsWith("in") ? "inbound" : "outbound", cb.from, cb.to, cb.callStatus, cb.callDuration ? Number(cb.callDuration) : null, cb.recordingUrl || null],
      );
      const [tickets] = await pool.query("SELECT id FROM call_tickets WHERE subject LIKE ? ORDER BY id DESC LIMIT 1", [`%${cb.to}%`]);
      if ((tickets as Array<{ id: number }>).length && cb.callStatus) {
        const statusMap: Record<string, string> = { completed: "resolved", busy: "pending", "no-answer": "pending", failed: "pending", canceled: "pending" };
        const next = statusMap[cb.callStatus] ?? "pending";
        await pool.query("UPDATE call_tickets SET status=? WHERE id=?", [next, (tickets as Array<{ id: number }>)[0].id]);
      }
      res.sendStatus(200);
    } catch (err) {
      console.error("[twilio-status]", err);
      res.sendStatus(500);
    }
  });

  return r;
}
