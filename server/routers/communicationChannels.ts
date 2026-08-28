import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getRawPool } from "../channels/db";
import { buildTextPayload, buildTemplatePayload } from "../channels/whatsapp";
import { buildCreateCallParams, buildTwiMLDialog } from "../channels/twilio";

const scope = z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().nullable() });

async function getActiveConfig(pool: ReturnType<typeof getRawPool>, orgId: number, channel: "whatsapp" | "twilio") {
  const [rows] = await pool.query("SELECT config_json FROM channel_accounts WHERE organizationId=? AND channel=? AND active=1 LIMIT 1", [orgId, channel]);
  const row = (rows as Array<{ config_json: string }>)[0];
  if (!row) return null;
  try {
    return JSON.parse(row.config_json) as Record<string, string>;
  } catch {
    return null;
  }
}

export const communicationChannelsRouter = router({
  config: router({
    get: protectedProcedure.input(scope.extend({ channel: z.enum(["whatsapp", "twilio"]) })).query(async ({ input }) => {
      const pool = getRawPool();
      const [rows] = await pool.query(
        "SELECT id, channel, name, active, updatedAt FROM channel_accounts WHERE organizationId=? AND channel=? LIMIT 1",
        [input.organizationId, input.channel],
      );
      return { config: (rows as Array<Record<string, unknown>>)[0] ?? null };
    }),
    save: protectedProcedure
      .input(scope.extend({ channel: z.enum(["whatsapp", "twilio"]), name: z.string().trim().min(2).max(120), config: z.record(z.string(), z.string()) }))
      .mutation(async ({ ctx, input }) => {
        const pool = getRawPool();
        await pool.query(
          `INSERT INTO channel_accounts (organizationId, branchId, channel, name, config_json, createdByUserId)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name), config_json=VALUES(config_json), active=1, createdByUserId=VALUES(createdByUserId)`,
          [input.organizationId, input.branchId, input.channel, input.name, JSON.stringify(input.config), ctx.user.id],
        );
        return { saved: true };
      }),
  }),

  whatsapp: router({
    sendText: protectedProcedure.input(scope.extend({ to: z.string().regex(/^[0-9]{8,15}$/), body: z.string().trim().min(1).max(4096) })).mutation(async ({ ctx, input }) => {
      const pool = getRawPool();
      const cfg = await getActiveConfig(pool, input.organizationId, "whatsapp");
      if (!cfg?.accessToken || !cfg?.phoneNumberId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "WhatsApp channel not configured (accessToken + phoneNumberId)" });
      const url = `https://graph.facebook.com/${cfg.apiVersion ?? "v21.0"}/${cfg.phoneNumberId}/messages`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${cfg.accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(buildTextPayload(input.to, input.body)),
      });
      const payload = (await res.json().catch(() => ({}))) as { messages?: Array<{ id: string }> };
      if (!res.ok) throw new TRPCError({ code: "BAD_GATEWAY", message: `WhatsApp API ${res.status}` });
      await pool.query(
        "INSERT INTO channel_messages (organizationId, branchId, channel, direction, platformMessageId, fromNumber, toNumber, body, status) VALUES (?,?,?,?,?,?,?,?,?)",
        [input.organizationId, input.branchId, "whatsapp", "outbound", payload.messages?.[0]?.id ?? null, cfg.phoneNumberId, input.to, input.body, "sent"],
      );
      return { messageId: payload.messages?.[0]?.id ?? null };
    }),
    sendTemplate: protectedProcedure
      .input(scope.extend({ to: z.string().regex(/^[0-9]{8,15}$/), templateName: z.string().min(1).max(128), languageCode: z.string().length(5) }))
      .mutation(async ({ input }) => {
        const pool = getRawPool();
        const cfg = await getActiveConfig(pool, input.organizationId, "whatsapp");
        if (!cfg?.accessToken || !cfg?.phoneNumberId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "WhatsApp channel not configured" });
        const url = `https://graph.facebook.com/${cfg.apiVersion ?? "v21.0"}/${cfg.phoneNumberId}/messages`;
        const res = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${cfg.accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify(buildTemplatePayload(input.to, input.templateName, input.languageCode)),
        });
        if (!res.ok) throw new TRPCError({ code: "BAD_GATEWAY", message: `WhatsApp API ${res.status}` });
        return { accepted: true };
      }),
  }),

  telephony: router({
    dialOut: protectedProcedure.input(scope.extend({ to: z.string().regex(/^\+?[0-9]{8,15}$/), greeting: z.string().trim().min(1).max(500).default("مرحبًا بك في ميدورا") })).mutation(async ({ ctx, input }) => {
      const pool = getRawPool();
      const cfg = await getActiveConfig(pool, input.organizationId, "twilio");
      if (!cfg?.accountSid || !cfg?.authToken || !cfg?.fromNumber || !cfg?.publicBaseUrl)
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Twilio channel not configured (accountSid + authToken + fromNumber + publicBaseUrl)" });
      const statusUrl = `${cfg.publicBaseUrl}/api/channels/twilio/status`;
      const params = buildCreateCallParams({ to: input.to, from: cfg.fromNumber, twiml: buildTwiMLDialog(input.greeting), statusCallback: statusUrl });
      const form = new URLSearchParams(params).toString();
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/Calls.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form,
      });
      const payload = (await res.json().catch(() => ({}))) as { sid?: string; status?: string };
      if (!res.ok) throw new TRPCError({ code: "BAD_GATEWAY", message: `Twilio API ${res.status}` });
      await pool.query(
        "INSERT INTO channel_calls (organizationId, branchId, platformCallSid, direction, fromNumber, toNumber, status) VALUES (?,?,?,?,?,?,?)",
        [input.organizationId, input.branchId, payload.sid ?? null, "outbound", cfg.fromNumber, input.to, payload.status ?? "queued"],
      );
      return { callSid: payload.sid ?? null, status: payload.status ?? "queued" };
    }),
  }),

  messages: router({
    list: protectedProcedure.input(scope.extend({ channel: z.enum(["whatsapp", "telephony"]).optional(), limit: z.number().int().min(1).max(200).default(50) })).query(async ({ input }) => {
      const pool = getRawPool();
      const [rows] = await pool.query(
        "SELECT * FROM channel_messages WHERE organizationId=? AND (? IS NULL OR channel=?) ORDER BY id DESC LIMIT ?",
        [input.organizationId, input.channel ?? null, input.channel ?? null, input.limit],
      );
      return { messages: rows };
    }),
  }),

  calls: router({
    list: protectedProcedure.input(scope.extend({ limit: z.number().int().min(1).max(200).default(50) })).query(async ({ input }) => {
      const pool = getRawPool();
      const [rows] = await pool.query("SELECT * FROM channel_calls WHERE organizationId=? ORDER BY id DESC LIMIT ?", [input.organizationId, input.limit]);
      return { calls: rows };
    }),
  }),
});
