import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { branchJurisdictions, branches, organizationMemberships, jurisdictionProfiles } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { createHash } from "node:crypto";

const connectorType = z.enum(["api", "portal"]);
const connectorStatus = z.enum(["draft", "test_ready", "production_ready", "suspended"]);

async function assertScope(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, role: string, organizationId: number, jurisdictionId: number, branchId?: number) {
  if (role !== "admin") {
    const membership = await db.select({ id: organizationMemberships.id }).from(organizationMemberships).where(and(
      eq(organizationMemberships.organizationId, organizationId),
      eq(organizationMemberships.userId, userId),
      eq(organizationMemberships.active, 1),
    )).limit(1);
    if (!membership.length) throw new TRPCError({ code: "FORBIDDEN", message: "Organization access denied" });
    if (branchId !== undefined) {
      const branch = await db.select({ id: branches.id }).from(branches).innerJoin(branchJurisdictions, eq(branchJurisdictions.branchId, branches.id)).where(and(
        eq(branches.id, branchId),
        eq(branches.organizationId, organizationId),
        eq(branchJurisdictions.jurisdictionId, jurisdictionId),
      )).limit(1);
      if (!branch.length) throw new TRPCError({ code: "FORBIDDEN", message: "Branch is outside the active insurance scope" });
    }
  }
  const jurisdiction = await db.select({ id: jurisdictionProfiles.id }).from(jurisdictionProfiles).where(and(
    eq(jurisdictionProfiles.id, jurisdictionId),
    eq(jurisdictionProfiles.countryCode, "EG"),
    eq(jurisdictionProfiles.active, 1),
  )).limit(1);
  if (!jurisdiction.length) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Active Egypt jurisdiction is required" });
}

function hashPayload(payload: string) {
  return createHash("sha256").update(payload).digest("hex");
}

export const insuranceExecutionRouter = router({
  payerConnectors: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), payerCode: z.string().min(2).max(80).optional() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
    await assertScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId);
    const [rows] = await db.execute(sql`SELECT * FROM insurance_payer_connectors WHERE organizationId = ${input.organizationId} AND jurisdictionId = ${input.jurisdictionId} ${input.payerCode ? sql`AND payerCode = ${input.payerCode}` : sql``} ORDER BY updatedAt DESC`);
    return rows;
  }),

  registerPayerConnector: protectedProcedure.input(z.object({
    organizationId: z.number().int().positive(),
    jurisdictionId: z.number().int().positive(),
    payerCode: z.string().regex(/^[A-Z0-9._-]{2,80}$/i),
    connectorType,
    endpointUrl: z.string().url().max(500).optional(),
    contractVersion: z.string().max(80).optional(),
    authMethod: z.string().max(80).optional(),
    credentialRef: z.string().max(180).optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
    await assertScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId);
    if (input.connectorType === "portal" && input.endpointUrl && !input.endpointUrl.startsWith("https://")) throw new TRPCError({ code: "BAD_REQUEST", message: "Portal connectors require HTTPS" });
    await db.execute(sql`INSERT INTO insurance_payer_connectors (organizationId,jurisdictionId,payerCode,connectorType,endpointUrl,status,contractVersion,authMethod,credentialRef,createdByUserId) VALUES (${input.organizationId},${input.jurisdictionId},${input.payerCode},${input.connectorType},${input.endpointUrl ?? null},'draft',${input.contractVersion ?? null},${input.authMethod ?? null},${input.credentialRef ?? null},${ctx.user.id}) ON DUPLICATE KEY UPDATE connectorType=VALUES(connectorType), endpointUrl=VALUES(endpointUrl), contractVersion=VALUES(contractVersion), authMethod=VALUES(authMethod), credentialRef=VALUES(credentialRef), updatedAt=CURRENT_TIMESTAMP`);
    return { success: true as const, status: "draft" as const, externalActivation: "blocked" as const };
  }),

  setPayerConnectorReadiness: protectedProcedure.input(z.object({
    organizationId: z.number().int().positive(),
    jurisdictionId: z.number().int().positive(),
    payerCode: z.string().regex(/^[A-Z0-9._-]{2,80}$/i),
    status: connectorStatus,
    eligibilityMappingVerified: z.boolean(),
    benefitsMappingVerified: z.boolean(),
    preauthMappingVerified: z.boolean(),
    claimMappingVerified: z.boolean(),
    remittanceMappingVerified: z.boolean(),
    rejectionMappingVerified: z.boolean(),
    attachmentsSupported: z.boolean(),
    sandboxVerified: z.boolean(),
    acceptanceCriteriaVerified: z.boolean(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
    await assertScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId);
    const allMapped = input.eligibilityMappingVerified && input.benefitsMappingVerified && input.preauthMappingVerified && input.claimMappingVerified && input.remittanceMappingVerified && input.rejectionMappingVerified && input.sandboxVerified && input.acceptanceCriteriaVerified;
    if (input.status === "production_ready" && !allMapped) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Production readiness requires verified payer mappings, sandbox validation, rejection handling and acceptance criteria" });
    await db.execute(sql`UPDATE insurance_payer_connectors SET status=${input.status}, eligibilityMappingVerified=${input.eligibilityMappingVerified ? 1 : 0}, benefitsMappingVerified=${input.benefitsMappingVerified ? 1 : 0}, preauthMappingVerified=${input.preauthMappingVerified ? 1 : 0}, claimMappingVerified=${input.claimMappingVerified ? 1 : 0}, remittanceMappingVerified=${input.remittanceMappingVerified ? 1 : 0}, rejectionMappingVerified=${input.rejectionMappingVerified ? 1 : 0}, attachmentsSupported=${input.attachmentsSupported ? 1 : 0}, sandboxVerified=${input.sandboxVerified ? 1 : 0}, acceptanceCriteriaVerified=${input.acceptanceCriteriaVerified ? 1 : 0}, approvedByUserId=${input.status === "production_ready" ? ctx.user.id : null}, lastVerifiedAt=${allMapped ? new Date() : null}, updatedAt=CURRENT_TIMESTAMP WHERE organizationId=${input.organizationId} AND jurisdictionId=${input.jurisdictionId} AND payerCode=${input.payerCode}`);
    return { success: true as const, status: input.status, externalActivation: input.status === "production_ready" ? "still_requires_credentials_and_contract" as const : "blocked" as const };
  }),

  coverageRules: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), payerCode: z.string().min(2).max(80), planCode: z.string().min(1).max(120).optional(), serviceCode: z.string().min(1).max(120).optional() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
    await assertScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId);
    const [rows] = await db.execute(sql`SELECT * FROM insurance_coverage_rules WHERE organizationId=${input.organizationId} AND jurisdictionId=${input.jurisdictionId} AND payerCode=${input.payerCode} AND active=1 ${input.planCode ? sql`AND planCode=${input.planCode}` : sql``} ${input.serviceCode ? sql`AND serviceCode=${input.serviceCode}` : sql``} ORDER BY effectiveFrom DESC`);
    return rows;
  }),

  upsertCoverageRule: protectedProcedure.input(z.object({
    organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), payerCode: z.string().min(2).max(80), planCode: z.string().min(1).max(120), serviceCode: z.string().min(1).max(120),
    benefitType: z.enum(["covered", "excluded", "conditional"]), coveragePercent: z.number().min(0).max(100).optional(), copayAmount: z.number().min(0).optional(), deductibleAmount: z.number().min(0).optional(), annualLimitAmount: z.number().min(0).optional(), visitLimit: z.number().int().min(0).optional(), requiresPreauthorization: z.boolean(), requiresReferral: z.boolean(), exclusions: z.array(z.string().max(160)).max(100).default([]), effectiveFrom: z.date(), effectiveTo: z.date().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
    await assertScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId);
    if (input.effectiveTo && input.effectiveTo <= input.effectiveFrom) throw new TRPCError({ code: "BAD_REQUEST", message: "Coverage effectiveTo must be after effectiveFrom" });
    await db.execute(sql`INSERT INTO insurance_coverage_rules (organizationId,jurisdictionId,payerCode,planCode,serviceCode,benefitType,coveragePercent,copayAmount,deductibleAmount,annualLimitAmount,visitLimit,requiresPreauthorization,requiresReferral,exclusionsJson,effectiveFrom,effectiveTo,createdByUserId) VALUES (${input.organizationId},${input.jurisdictionId},${input.payerCode},${input.planCode},${input.serviceCode},${input.benefitType},${input.coveragePercent ?? null},${input.copayAmount ?? null},${input.deductibleAmount ?? null},${input.annualLimitAmount ?? null},${input.visitLimit ?? null},${input.requiresPreauthorization ? 1 : 0},${input.requiresReferral ? 1 : 0},${JSON.stringify(input.exclusions)},${input.effectiveFrom},${input.effectiveTo ?? null},${ctx.user.id})`);
    return { success: true as const, persisted: true as const };
  }),

  claimEvents: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), claimId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
    await assertScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const [rows] = await db.execute(sql`SELECT id,claimId,fromStatus,toStatus,eventType,externalReference,message,payloadHash,previousHash,recordHash,createdByUserId,createdAt FROM insurance_claim_events WHERE organizationId=${input.organizationId} AND jurisdictionId=${input.jurisdictionId} AND branchId=${input.branchId} AND claimId=${input.claimId} ORDER BY id ASC`);
    return rows;
  }),

  attachClaimDocument: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), claimId: z.number().int().positive(), documentType: z.string().min(2).max(80), storageRef: z.string().min(1).max(500), fileName: z.string().max(255).optional(), contentType: z.string().max(120).optional(), sha256: z.string().regex(/^[a-f0-9]{64}$/i) })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
    await assertScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const claim = await db.execute(sql`SELECT id FROM insurance_claims WHERE id=${input.claimId} AND organizationId=${input.organizationId} AND jurisdictionId=${input.jurisdictionId} AND branchId=${input.branchId} LIMIT 1`);
    const rows = Array.isArray(claim) ? (claim as any)[0] : [];
    if (!Array.isArray(rows) || !rows.length) throw new TRPCError({ code: "NOT_FOUND", message: "Claim is outside the active scope" });
    await db.execute(sql`INSERT INTO insurance_claim_attachments (organizationId,jurisdictionId,branchId,claimId,documentType,storageRef,fileName,contentType,sha256,status,createdByUserId) VALUES (${input.organizationId},${input.jurisdictionId},${input.branchId},${input.claimId},${input.documentType},${input.storageRef},${input.fileName ?? null},${input.contentType ?? null},${input.sha256},'referenced',${ctx.user.id}) ON DUPLICATE KEY UPDATE storageRef=VALUES(storageRef), status='referenced'`);
    return { success: true as const, attachmentState: "referenced" as const, externalSubmission: "blocked" as const };
  }),

  payerMessages: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), payerCode: z.string().min(2).max(80) })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
    await assertScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const [rows] = await db.execute(sql`SELECT id,payerCode,direction,messageType,claimId,preauthorizationId,externalReference,payloadHash,status,createdByUserId,createdAt,updatedAt FROM insurance_payer_messages WHERE organizationId=${input.organizationId} AND jurisdictionId=${input.jurisdictionId} AND branchId=${input.branchId} AND payerCode=${input.payerCode} ORDER BY id DESC LIMIT 200`);
    return rows;
  }),

  queuePayerMessage: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), payerCode: z.string().min(2).max(80), messageType: z.string().min(2).max(80), claimId: z.number().int().positive().optional(), preauthorizationId: z.number().int().positive().optional(), externalReference: z.string().max(160).optional(), payload: z.string().min(1).max(200000) })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
    await assertScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const payloadHash = hashPayload(input.payload);
    await db.execute(sql`INSERT INTO insurance_payer_messages (organizationId,jurisdictionId,branchId,payerCode,direction,messageType,claimId,preauthorizationId,externalReference,payloadHash,status,createdByUserId) VALUES (${input.organizationId},${input.jurisdictionId},${input.branchId},${input.payerCode},'outbound',${input.messageType},${input.claimId ?? null},${input.preauthorizationId ?? null},${input.externalReference ?? null},${payloadHash},'blocked',${ctx.user.id})`);
    return { success: true as const, status: "blocked" as const, payloadHash, networkSubmission: "disabled" as const };
  }),
});
