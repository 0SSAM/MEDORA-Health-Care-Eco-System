import { TRPCError } from "@trpc/server";
import { parse as parseCookie } from "cookie";
import { createHash } from "node:crypto";
import { and, desc, eq, gte, inArray, isNull, like, lt, lte, or, sql } from "drizzle-orm";
import { COOKIE_NAME } from "@shared/const";
import { prescriptionIntakes, ePrescriptions, ePrescriptionLines, healthcarePatients, scheduledJobs, customerProfiles, careInteractions, callTickets, catalogItems, catalogSyncQueue, offlineDrafts, salesReturns, taxInvoices, taxInvoiceTemplates, complianceEvidence, compliancePacks, jurisdictionProfiles, branchJurisdictions, branchUsers, inventoryBatches, products, promotions, sales, saleItems, branches, organizations, organizationMemberships, auditLogs, decisionLogs, heldInvoices, cashierShifts, cashClosures, generalLedgerAccounts, generalLedgerEntries, accountingFiscalPeriods, costCenters, otherExpenses, expenseDocuments, interBranchTransfers, interBranchTransferLines, loyaltyMembers, loyaltyTransactions, membershipPlans, customerMemberships } from "../../drizzle/schema";
import { getDb } from "../db";
import { createHeartbeatJob } from "../_core/heartbeat";
import { z } from "zod";
import { sortAvailableStockByExpiry } from "../domain/pos-stock-order";
import { availableStockInputSchema } from "../domain/pos-stock-input";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure as baseProtectedProcedure, router } from "../_core/trpc";
import { enforceDiscount, selectFefoBatches, type AppRole } from "../domain/rules";
import { assertPrescriptionConfirmed, preparePosSale, validatePrescriptionUpload } from "../domain/erp";
import { generateInvoiceDocument } from "../domain/invoicing-policy";
import { assertCompliancePackUsable, assertJurisdictionProfileReady } from "../domain/regional-engine";
import { assertBranchAssignmentReady } from "../domain/branch-compliance";
import { storageGetSignedUrl, storagePut } from "../storage";
import { activeCatalogFields, assertCatalogEvidence, assertConsumableCatalogContext } from "../domain/catalog-policy";
import { assertRecordBelongsToJurisdiction, assertRecordBelongsToScope } from "../domain/data-boundary";
import { canAccessJurisdiction } from "../domain/jurisdiction-access";
import { canAccessBranch } from "../domain/branch-access";
import { assertAssigneeScope, assertCustomerTicketScope, buildCallTicketUpdate } from "../domain/customer-care-policy";
import { evaluatePromotion } from "../domain/promotion-policy";
import { assertCatalogIntakeReady } from "../domain/catalog-intake-policy";
import { assertDeviceTrustReady } from "../domain/device-trust-policy";
import { hashAuditRecord } from "../domain/internal-auth";
import { assertVatInvoiceReady, calculateVatInvoice } from "../domain/vat-invoice-policy";
import { assessConsumerReturn, assertReturnPolicyConfigured } from "../domain/consumer-returns-policy";
import { safeErrorLabel } from "../domain/safe-error";
import { canViewFinancialData } from "../domain/organization-access";

async function getUserBranchIds(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, role: string) {
  if (role === "admin") return null;
  const memberships = await db.select({ branchId: branchUsers.branchId }).from(branchUsers).where(and(eq(branchUsers.userId, userId), eq(branchUsers.active, 1)));
  return memberships.map(({ branchId }) => branchId);
}

async function getBranchOrganizationId(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, branchId: number) {
  const branch = (await db.select({ organizationId: branches.organizationId }).from(branches).where(eq(branches.id, branchId)).limit(1))[0];
  if (!branch?.organizationId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Branch has no organization scope" });
  return branch.organizationId;
}

async function getUserOrganizationIds(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number) {
  const memberships = await db.select({ organizationId: organizationMemberships.organizationId }).from(organizationMemberships).where(and(eq(organizationMemberships.userId, userId), eq(organizationMemberships.active, 1)));
  return memberships.map((membership) => membership.organizationId);
}

async function assertFinancialOrganizationAccess(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, userRole: string, organizationId: number) {
  const memberships = await db.select({ organizationId: organizationMemberships.organizationId, active: organizationMemberships.active, organizationRole: organizationMemberships.organizationRole }).from(organizationMemberships).where(and(eq(organizationMemberships.userId, userId), eq(organizationMemberships.active, 1)));
  if (!canViewFinancialData(userRole, memberships, organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Financial access requires an authorized organization membership" });
}

const protectedProcedure = baseProtectedProcedure.use(async ({ ctx, next, path, getRawInput }) => {
  if (!path.startsWith("erp.accounting.") || ctx.user.role === "admin") return next();
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  const rawInput = await getRawInput();
  const input = rawInput && typeof rawInput === "object" && !Array.isArray(rawInput)
    ? rawInput as { organizationId?: unknown; expenseId?: unknown; transferId?: unknown }
    : undefined;
  let organizationId = typeof input?.organizationId === "number" ? input.organizationId : undefined;
  if (organizationId === undefined && typeof input?.expenseId === "number") {
    organizationId = (await db.select({ organizationId: otherExpenses.organizationId }).from(otherExpenses).where(eq(otherExpenses.id, input.expenseId)).limit(1))[0]?.organizationId;
  }
  if (organizationId === undefined && typeof input?.transferId === "number") {
    organizationId = (await db.select({ organizationId: interBranchTransfers.organizationId }).from(interBranchTransfers).where(eq(interBranchTransfers.id, input.transferId)).limit(1))[0]?.organizationId;
  }
  if (organizationId === undefined) throw new TRPCError({ code: "FORBIDDEN", message: "Accounting access requires an explicit authorized organization scope" });
  await assertFinancialOrganizationAccess(db, ctx.user.id, ctx.user.role, organizationId);
  return next();
});

async function assertUserBranchAccess(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, role: string, branchId: number) {
  const branchIds = await getUserBranchIds(db, userId, role);
  if (branchIds !== null && canAccessBranch(role, branchIds, branchId) || branchIds === null) return;
  throw new TRPCError({ code: "FORBIDDEN", message: "User is not assigned to this branch" });
}

async function assertUserJurisdictionAccess(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, role: string, jurisdictionId: number) {
  if (role === "admin") return;
  const memberships = await db.select().from(branchUsers).where(and(eq(branchUsers.userId, userId), eq(branchUsers.active, 1)));
  const assignments = [];
  for (const membership of memberships) {
    const assignment = (await db.select().from(branchJurisdictions).where(and(eq(branchJurisdictions.branchId, membership.branchId), eq(branchJurisdictions.jurisdictionId, jurisdictionId))).limit(1))[0];
    if (assignment) assignments.push({ active: 1, jurisdictionId: assignment.jurisdictionId });
  }
  if (canAccessJurisdiction(role, assignments, jurisdictionId)) return;
  throw new TRPCError({ code: "FORBIDDEN", message: "User is not assigned to this jurisdiction" });
}

const pharmacistProcedure = protectedProcedure.use(({ ctx, next }) => {
  const role = ctx.user.role as AppRole;
  if (!["admin", "manager", "pharmacist"].includes(role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Pharmacist review permission required" });
  }
  return next();
});

const catalogEditorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!["admin", "manager", "pharmacist"].includes(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Catalog editor permission required" });
  }
  return next();
});

const catalogImportRowSchema = z.object({
  category: z.string().max(40).optional(), sku: z.string().max(80).optional(), barcode: z.string().max(80).optional(), gtin: z.string().max(80).optional(), priceEgp: z.string().max(40).optional(), nameAr: z.string().max(240).optional(), nameEn: z.string().max(240).optional(), genericName: z.string().max(240).optional(), manufacturer: z.string().max(220).optional(), registrationNumber: z.string().max(120).optional(), sourceAuthority: z.string().max(40).optional(), sourceRecordId: z.string().max(160).optional(), sourceUrl: z.string().max(500).optional(), sourceLicense: z.string().max(500).optional(), sourceNotes: z.string().max(4000).optional(), sourceRetrievedAt: z.string().max(80).optional(),
});

type ValidCatalogImportRow = Omit<z.infer<typeof catalogImportRowSchema>, "category" | "sku" | "nameAr" | "sourceAuthority" | "priceEgp" | "sourceRetrievedAt"> & { category: "medicine" | "cosmetic" | "medical_supply"; sku: string; nameAr: string; sourceAuthority: string; priceEgp?: number; sourceRetrievedAt?: Date };

function normalizeCatalogImportRow(raw: unknown): { row?: ValidCatalogImportRow; errors: string[] } {
  const parsed = catalogImportRowSchema.safeParse(raw);
  if (!parsed.success) return { errors: ["صيغة الصف أو طول أحد الحقول غير صالح"] };
  const value = parsed.data;
  const errors: string[] = [];
  const category = value.category?.trim() as ValidCatalogImportRow["category"] | undefined;
  if (!category || !["medicine", "cosmetic", "medical_supply"].includes(category)) errors.push("category غير صالح");
  const sku = value.sku?.trim(); if (!sku) errors.push("SKU مطلوب");
  const nameAr = value.nameAr?.trim(); if (!nameAr) errors.push("الاسم العربي مطلوب");
  const sourceAuthority = value.sourceAuthority?.trim() || "LOCAL_PENDING_REVIEW";
  const priceText = value.priceEgp?.trim(); const priceEgp: number | undefined = priceText ? Number(priceText) : undefined;
  if (priceText && (priceEgp === undefined || !Number.isFinite(priceEgp) || priceEgp < 0)) errors.push("السعر غير صالح");
  const sourceRetrievedAt = value.sourceRetrievedAt?.trim(); const retrieved = sourceRetrievedAt ? new Date(sourceRetrievedAt) : undefined;
  if (sourceRetrievedAt && (!retrieved || Number.isNaN(retrieved.getTime()))) errors.push("تاريخ المصدر غير صالح");
  if (errors.length) return { errors };
  const { priceEgp: _rawPrice, sourceRetrievedAt: _rawRetrieved, category: _rawCategory, sku: _rawSku, nameAr: _rawNameAr, sourceAuthority: _rawAuthority, ...rest } = value;
  return { row: { ...rest, category: category!, sku: sku!, nameAr: nameAr!, sourceAuthority, priceEgp, sourceRetrievedAt: retrieved }, errors: [] };
}

function catalogDryRunDigest(input: { organizationId: number; branchId: number; jurisdictionId: number; rows: unknown[] }) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function signCatalogDryRun(input: { organizationId: number; branchId: number; jurisdictionId: number; digest: string; expiresAt: number }) {
  const payload = { eventType: "catalog_bulk_import_dry_run", organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, requestId: `${input.digest}:${input.expiresAt}`, createdAt: new Date(input.expiresAt).toISOString() };
  return `${input.expiresAt}.${input.digest}.${hashAuditRecord(payload)}`;
}

function verifyCatalogDryRunToken(token: string, scope: { organizationId: number; branchId: number; jurisdictionId: number; digest: string }) {
  const [expiresText, digest, signature] = token.split("."); const expiresAt = Number(expiresText);
  if (!expiresAt || expiresAt < Date.now() || digest !== scope.digest || !signature) return false;
  return signCatalogDryRun({ ...scope, expiresAt }) === token;
}

async function assertCatalogImportScope(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, role: string, input: { organizationId: number; branchId: number; jurisdictionId: number }) {
  await assertUserBranchAccess(db, userId, role, input.branchId);
  await assertUserJurisdictionAccess(db, userId, role, input.jurisdictionId);
  const organizationId = await getBranchOrganizationId(db, input.branchId);
  if (organizationId !== input.organizationId) throw new TRPCError({ code: "FORBIDDEN", message: "Import scope does not match the selected branch" });
  if (role !== "admin" && !(await getUserOrganizationIds(db, userId)).includes(input.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Import organization is outside the active scope" });
  const assignment = (await db.select().from(branchJurisdictions).where(and(eq(branchJurisdictions.branchId, input.branchId), eq(branchJurisdictions.jurisdictionId, input.jurisdictionId))).limit(1))[0];
  try { assertBranchAssignmentReady(assignment); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Branch jurisdiction assignment is not ready" }); }
  const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, input.jurisdictionId)).limit(1))[0];
  if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Jurisdiction not found" });
  try { assertJurisdictionProfileReady({ countryCode: profile.countryCode, active: profile.active === 1, legalAuthorityProfile: profile.legalAuthorityProfile, language: profile.language, defaultLocale: profile.defaultLocale, currencyCode: profile.currencyCode, timezone: profile.timezone, taxProfile: profile.taxProfile, dateFormat: profile.dateFormat, numberSystem: profile.numberSystem }); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Active jurisdiction profile is required for import" }); }
}

const clinicianProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!["admin", "manager", "clinical_lead"].includes(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Clinician prescription permission required" });
  }
  return next();
});

const customerCareProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!["admin", "manager", "pharmacist", "cashier"].includes(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Customer care permission required" });
  }
  return next();
});

const customerCareDraftSchema = z.object({
  fullName: z.string().min(2).max(220),
  phone: z.string().min(7).max(40),
  consentStatus: z.enum(["pending", "granted", "withdrawn"]).default("pending"),
  chronicCareEnabled: z.boolean().default(false),
  notes: z.string().max(4000).optional(),
  branchId: z.number().int().positive(),
});

const callCentreDraftSchema = z.object({
  subject: z.string().min(2).max(220),
  channel: z.enum(["phone", "whatsapp", "web", "in_person"]),
  direction: z.enum(["inbound", "outbound"]),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  customerId: z.number().int().positive().optional(),
  branchId: z.number().int().positive(),
  callbackAt: z.coerce.date().optional(),
});

export const erpRouter = router({
  forecast: router({
    salesHistory: protectedProcedure
      .input(z.object({ branchId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), productIds: z.array(z.number().int().positive()).max(100).optional(), historyDays: z.number().int().min(7).max(180).default(56) }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId);
        await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, input.jurisdictionId);
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Sales history is outside the active organization scope" });
        const start = new Date(Date.now() - (input.historyDays - 1) * 24 * 60 * 60 * 1000);
        const filters = [eq(sales.organizationId, organizationId), eq(sales.branchId, input.branchId), eq(sales.jurisdictionId, input.jurisdictionId), eq(sales.saleStatus, "completed"), gte(sales.createdAt, start)];
        const rows = await db.select({ productId: saleItems.productId, day: sql<string>`DATE(${sales.createdAt})`, units: sql<string>`SUM(${saleItems.quantity})` }).from(saleItems).innerJoin(sales, eq(saleItems.saleId, sales.id)).where(and(...filters, ...(input.productIds?.length ? [inArray(saleItems.productId, input.productIds)] : []))).groupBy(saleItems.productId, sql`DATE(${sales.createdAt})`);
        const dayKeys = Array.from({ length: input.historyDays }, (_, index) => { const day = new Date(start.getTime() + index * 24 * 60 * 60 * 1000); return day.toISOString().slice(0, 10); });
        const byProduct = new Map<number, Map<string, number>>();
        for (const row of rows) { const product = byProduct.get(row.productId) ?? new Map<string, number>(); product.set(String(row.day).slice(0, 10), Number(row.units ?? 0)); byProduct.set(row.productId, product); }
        return Array.from(byProduct.entries()).map(([productId, values]) => ({ productId, historyDays: dayKeys.map(day => values.get(day) ?? 0), observedDays: dayKeys.filter(day => values.has(day)).length, historyStart: dayKeys[0], historyEnd: dayKeys[dayKeys.length - 1], scope: { organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId } }));
      }),
  }),
  analytics: router({
    branchOverview: protectedProcedure
      .input(z.object({ branchId: z.number().int().positive(), jurisdictionId: z.number().int().positive().optional(), days: z.number().int().min(1).max(31).default(7) }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId);
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Analytics is outside the active organization scope" });
        const assignment = input.jurisdictionId ? (await db.select().from(branchJurisdictions).where(and(eq(branchJurisdictions.branchId, input.branchId), eq(branchJurisdictions.jurisdictionId, input.jurisdictionId))).limit(1))[0] : (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, input.branchId)).limit(1))[0];
        const start = new Date(Date.now() - (input.days - 1) * 24 * 60 * 60 * 1000);
        const scopeFilters = [eq(sales.organizationId, organizationId), eq(sales.branchId, input.branchId), eq(sales.saleStatus, "completed"), gte(sales.createdAt, start), ...(input.jurisdictionId ? [eq(sales.jurisdictionId, input.jurisdictionId)] : [])];
        const summaryRows = await db.select({ salesCount: sql<string>`COUNT(*)`, totalSales: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)`, averageSale: sql<string>`COALESCE(AVG(${sales.totalAmount}), 0)` }).from(sales).where(and(...scopeFilters));
        const paymentRows = await db.select({ paymentMethod: sales.paymentMethod, total: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)`, count: sql<string>`COUNT(*)` }).from(sales).where(and(...scopeFilters)).groupBy(sales.paymentMethod);
        const trendRows = await db.select({ day: sql<string>`DATE(${sales.createdAt})`, total: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)`, count: sql<string>`COUNT(*)` }).from(sales).where(and(...scopeFilters)).groupBy(sql`DATE(${sales.createdAt})`).orderBy(sql`DATE(${sales.createdAt})`);
        const inventoryFilters = [eq(inventoryBatches.organizationId, organizationId), eq(inventoryBatches.branchId, input.branchId), ...(input.jurisdictionId ? [eq(inventoryBatches.jurisdictionId, input.jurisdictionId)] : [])];
        const inventoryRows = await db.select({ productId: products.id, nameAr: products.nameAr, sku: products.sku, quantityOnHand: sql<string>`COALESCE(SUM(${inventoryBatches.quantityOnHand}), 0)`, reorderPoint: sql<string>`COALESCE(MAX(${inventoryBatches.reorderPoint}), 0)`, nearestExpiry: sql<Date | null>`MIN(${inventoryBatches.expiryDate})` }).from(inventoryBatches).innerJoin(products, eq(products.id, inventoryBatches.productId)).where(and(...inventoryFilters, eq(products.organizationId, organizationId), eq(products.active, 1))).groupBy(products.id, products.nameAr, products.sku).orderBy(sql`SUM(${inventoryBatches.quantityOnHand}) ASC`).limit(100);
        const now = Date.now();
        const inventoryAlerts = inventoryRows.map(row => { const quantityOnHand = Number(row.quantityOnHand ?? 0); const reorderPoint = Number(row.reorderPoint ?? 0); const expiry = row.nearestExpiry ? new Date(row.nearestExpiry).getTime() : null; const daysToExpiry = expiry === null ? null : Math.ceil((expiry - now) / 86400000); const severity = quantityOnHand <= 0 ? "critical" : daysToExpiry !== null && daysToExpiry <= 30 ? "warning" : quantityOnHand <= reorderPoint ? "warning" : "normal"; return { productId: row.productId, nameAr: row.nameAr, sku: row.sku, quantityOnHand, reorderPoint, nearestExpiry: row.nearestExpiry, daysToExpiry, severity }; }).filter(item => item.severity !== "normal").sort((a, b) => (a.severity === "critical" ? -1 : 1) - (b.severity === "critical" ? -1 : 1) || a.quantityOnHand - b.quantityOnHand);
        return { scope: { organizationId, branchId: input.branchId, jurisdictionId: assignment?.jurisdictionId ?? input.jurisdictionId ?? null }, period: { days: input.days, start }, summary: { salesCount: Number(summaryRows[0]?.salesCount ?? 0), totalSales: Number(summaryRows[0]?.totalSales ?? 0), averageSale: Number(summaryRows[0]?.averageSale ?? 0) }, paymentMix: paymentRows.map(row => ({ paymentMethod: row.paymentMethod, total: Number(row.total ?? 0), count: Number(row.count ?? 0) })), trend: trendRows.map(row => ({ day: String(row.day).slice(0, 10), total: Number(row.total ?? 0), count: Number(row.count ?? 0) })), inventory: { totalTrackedProducts: inventoryRows.length, alertCount: inventoryAlerts.length, criticalCount: inventoryAlerts.filter(item => item.severity === "critical").length, alerts: inventoryAlerts.slice(0, 20) }, refreshedAt: new Date() };
      }),
  }),
  policy: router({
    validateDiscount: protectedProcedure
      .input(z.object({ officialPrice: z.number().nonnegative(), discountAmount: z.number().nonnegative() }))
      .query(({ input }) => enforceDiscount(input.officialPrice, input.discountAmount)),
    planFefo: protectedProcedure
      .input(z.object({ requestedQuantity: z.number().positive(), batches: z.array(z.object({ id: z.string(), jurisdictionId: z.number().int().positive(), expiryDate: z.coerce.date(), quantityOnHand: z.number().nonnegative() })) }))
      .query(({ input }) => selectFefoBatches(input.batches, input.requestedQuantity)),
  }),
  pos: router({
    generateInvoicePreview: protectedProcedure
      .input(z.object({ branchId: z.number().int().positive(), invoiceNumber: z.string().min(3).max(80), currencyCode: z.string().length(3), subtotal: z.number().nonnegative(), discountAmount: z.number().nonnegative(), totalAmount: z.number().nonnegative(), items: z.array(z.object({ sku: z.string().min(1).max(80), quantity: z.number().positive(), unitPrice: z.number().nonnegative() })).min(1) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const assignment = (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, input.branchId)).limit(1))[0];
        try {
          assertBranchAssignmentReady(assignment);
          await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId);
          await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, assignment.jurisdictionId);
        } catch (error) {
          throw new TRPCError({ code: error instanceof TRPCError ? error.code : "PRECONDITION_FAILED", message: "Scoped branch access rejected" });
        }
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, assignment.jurisdictionId)).limit(1))[0];
        const pack = (await db.select().from(compliancePacks).where(and(eq(compliancePacks.jurisdictionId, assignment.jurisdictionId), eq(compliancePacks.status, "approved"))).orderBy(desc(compliancePacks.createdAt)).limit(1))[0];
        if (!profile || !pack) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Approved current invoice compliance pack required" });
        const evidence = await db.select().from(complianceEvidence).where(and(eq(complianceEvidence.packId, pack.id), eq(complianceEvidence.jurisdictionId, assignment.jurisdictionId), eq(complianceEvidence.operation, "catalog"), eq(complianceEvidence.verificationStatus, "verified")));
        try {
          assertCompliancePackUsable({ countryCode: profile.countryCode, active: profile.active === 1, legalAuthorityProfile: profile.legalAuthorityProfile, language: profile.language, defaultLocale: profile.defaultLocale, currencyCode: profile.currencyCode, timezone: profile.timezone, taxProfile: profile.taxProfile, dateFormat: profile.dateFormat, numberSystem: profile.numberSystem }, { jurisdictionId: pack.jurisdictionId, packVersion: pack.packVersion, status: pack.status, effectiveFrom: pack.effectiveFrom, reviewDueAt: pack.reviewDueAt, rules: JSON.parse(pack.rulesJson) as Record<string, boolean>, evidenceCount: evidence.length }, "invoice");
        } catch (error) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Invoice compliance validation rejected the request" });
        }
        for (const item of input.items) {
          const catalogItem = (await db.select().from(catalogItems).where(and(eq(catalogItems.sku, item.sku), eq(catalogItems.organizationId, organizationId), eq(catalogItems.jurisdictionId, assignment.jurisdictionId))).limit(1))[0];
          if (!catalogItem || catalogItem.verificationStatus !== "VERIFIED") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Invoice catalog record is not verified for this scope" });
        }
        try {
          return { ...generateInvoiceDocument({ document: input, catalogScope: { jurisdictionId: assignment.jurisdictionId, organizationId, catalogJurisdictionId: assignment.jurisdictionId, catalogOrganizationId: organizationId, catalogVerificationStatus: "approved", verifiedEvidenceCount: evidence.length } }), jurisdictionId: assignment.jurisdictionId, organizationId, persisted: false };
        } catch (error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invoice validation rejected the request" });
        }
      }),
    availableStock: protectedProcedure
      .input(availableStockInputSchema)
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const assignment = (await db.select().from(branchJurisdictions).where(and(eq(branchJurisdictions.branchId, input.branchId), eq(branchJurisdictions.jurisdictionId, input.jurisdictionId))).limit(1))[0];
        try { assertBranchAssignmentReady(assignment); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, input.jurisdictionId); } catch (error) { throw new TRPCError({ code: error instanceof TRPCError ? error.code : "PRECONDITION_FAILED", message: "Scoped branch access rejected" }); }
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        const productFilters = [eq(products.organizationId, organizationId), eq(products.jurisdictionId, input.jurisdictionId), eq(products.active, 1), ...(input.query.trim() ? [or(like(products.nameAr, `%${input.query.trim()}%`), like(products.nameEn, `%${input.query.trim()}%`), like(products.sku, `%${input.query.trim()}%`), like(products.barcode, `%${input.query.trim()}%`))] : [])];
        const productRows = await db.select().from(products).where(and(...productFilters)).limit(100);
        const result: Array<{ productId: number; batchId: number; sku: string; barcode: string | null; nameAr: string; nameEn: string | null; unitPrice: number; batchNumber: string; expiryDate: Date; quantityOnHand: number; unit: string }> = [];
        for (const product of productRows) {
          if (!product.catalogItemId) continue;
          const catalog = (await db.select({ verificationStatus: catalogItems.verificationStatus }).from(catalogItems).where(and(eq(catalogItems.id, product.catalogItemId), eq(catalogItems.organizationId, organizationId), eq(catalogItems.jurisdictionId, input.jurisdictionId))).limit(1))[0];
          if (!catalog || catalog.verificationStatus !== "VERIFIED") continue;
          const batches = await db.select().from(inventoryBatches).where(and(eq(inventoryBatches.productId, product.id), eq(inventoryBatches.organizationId, organizationId), eq(inventoryBatches.branchId, input.branchId), eq(inventoryBatches.jurisdictionId, input.jurisdictionId), sql`${inventoryBatches.quantityOnHand} > 0`)).orderBy(inventoryBatches.expiryDate).limit(8);
          for (const batch of batches) result.push({ productId: product.id, batchId: batch.id, sku: product.sku, barcode: product.barcode, nameAr: product.nameAr, nameEn: product.nameEn, unitPrice: Number(product.officialPrice), batchNumber: batch.batchNumber, expiryDate: batch.expiryDate, quantityOnHand: Number(batch.quantityOnHand), unit: "وحدة" });
        }
        // MySQL drivers may return DATETIME values as strings at runtime even when the
        // Drizzle type is Date. Normalize after the fully scoped query before ordering.
        return sortAvailableStockByExpiry(result).slice(0, 100);
      }),
    holdInvoice: protectedProcedure
      .input(z.object({ branchId: z.number().int().positive(), invoiceNumber: z.string().trim().min(3).max(80), paymentMethod: z.enum(["cash", "meeza", "instapay", "insurance"]), items: z.array(z.object({ productId: z.number().int().positive(), batchId: z.number().int().positive(), sku: z.string().min(1).max(64), barcode: z.string().max(64).nullable(), nameAr: z.string().min(1).max(220), nameEn: z.string().max(220).nullable(), unitPrice: z.number().nonnegative(), batchNumber: z.string().min(1).max(80), expiryDate: z.coerce.date(), quantityOnHand: z.number().nonnegative(), unit: z.string().min(1).max(24), quantity: z.number().positive() })).min(1) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const assignment = (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, input.branchId)).limit(1))[0];
        try { assertBranchAssignmentReady(assignment); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, assignment.jurisdictionId); } catch (error) { throw new TRPCError({ code: error instanceof TRPCError ? error.code : "PRECONDITION_FAILED", message: "Scoped branch access rejected" }); }
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        const payloadJson = JSON.stringify(input.items);
        const created = await db.insert(heldInvoices).values({ organizationId, branchId: input.branchId, jurisdictionId: assignment.jurisdictionId, cashierId: ctx.user.id, invoiceNumber: input.invoiceNumber, paymentMethod: input.paymentMethod, payloadJson });
        const heldId = Number(created[0].insertId); const createdAt = new Date().toISOString();
        await db.insert(auditLogs).values({ userId: ctx.user.id, organizationId, branchId: input.branchId, action: "pos_invoice_held", entityType: "held_invoice", entityId: String(heldId), previousHash: null, recordHash: hashAuditRecord({ eventType: "pos_invoice_held", userId: ctx.user.id, organizationId, branchId: input.branchId, jurisdictionId: assignment.jurisdictionId, requestId: String(heldId), createdAt }) });
        return { heldId, status: "HELD" as const };
      }),
    listHeldInvoices: protectedProcedure
      .input(z.object({ branchId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const assignment = (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, input.branchId)).limit(1))[0];
        try { assertBranchAssignmentReady(assignment); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, assignment.jurisdictionId); } catch (error) { throw new TRPCError({ code: error instanceof TRPCError ? error.code : "PRECONDITION_FAILED", message: "Scoped branch access rejected" }); }
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        const rows = await db.select().from(heldInvoices).where(and(eq(heldInvoices.organizationId, organizationId), eq(heldInvoices.branchId, input.branchId), eq(heldInvoices.jurisdictionId, assignment.jurisdictionId), eq(heldInvoices.cashierId, ctx.user.id))).orderBy(desc(heldInvoices.createdAt)).limit(100);
        return rows.map(row => { let items: unknown[] = []; try { items = JSON.parse(row.payloadJson) as unknown[]; } catch { items = []; } return { id: row.id, invoiceNumber: row.invoiceNumber, paymentMethod: row.paymentMethod, items, createdAt: row.createdAt }; });
      }),
    restoreHeldInvoice: protectedProcedure
      .input(z.object({ branchId: z.number().int().positive(), heldId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const assignment = (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, input.branchId)).limit(1))[0];
        try { assertBranchAssignmentReady(assignment); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, assignment.jurisdictionId); } catch (error) { throw new TRPCError({ code: error instanceof TRPCError ? error.code : "PRECONDITION_FAILED", message: "Scoped branch access rejected" }); }
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        const row = (await db.select().from(heldInvoices).where(and(eq(heldInvoices.id, input.heldId), eq(heldInvoices.organizationId, organizationId), eq(heldInvoices.branchId, input.branchId), eq(heldInvoices.jurisdictionId, assignment.jurisdictionId), eq(heldInvoices.cashierId, ctx.user.id))).limit(1))[0];
        if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Held invoice not found in the active scope" });
        let items: unknown[]; try { items = JSON.parse(row.payloadJson) as unknown[]; } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Held invoice payload is invalid" }); }
        await db.delete(heldInvoices).where(and(eq(heldInvoices.id, row.id), eq(heldInvoices.organizationId, organizationId), eq(heldInvoices.branchId, input.branchId), eq(heldInvoices.jurisdictionId, assignment.jurisdictionId), eq(heldInvoices.cashierId, ctx.user.id)));
        const createdAt = new Date().toISOString();
        await db.insert(auditLogs).values({ userId: ctx.user.id, organizationId, branchId: input.branchId, action: "pos_invoice_restored", entityType: "held_invoice", entityId: String(row.id), previousHash: null, recordHash: hashAuditRecord({ eventType: "pos_invoice_restored", userId: ctx.user.id, organizationId, branchId: input.branchId, jurisdictionId: assignment.jurisdictionId, requestId: String(row.id), createdAt }) });
        return { id: row.id, invoiceNumber: row.invoiceNumber, paymentMethod: row.paymentMethod, items, createdAt: row.createdAt };
      }),
    prepareSale: protectedProcedure
      .input(z.object({ branchId: z.number().int().positive(), officialPrice: z.number().nonnegative(), quantity: z.number().positive(), discountAmount: z.number().nonnegative(), batches: z.array(z.object({ id: z.string(), jurisdictionId: z.number().int().positive(), expiryDate: z.coerce.date(), quantityOnHand: z.number().nonnegative() })) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const assignment = (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, input.branchId)).limit(1))[0];
        try { assertBranchAssignmentReady(assignment); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, assignment.jurisdictionId); } catch (error) { throw new TRPCError({ code: error instanceof TRPCError ? error.code : "PRECONDITION_FAILED", message: "Scoped branch access rejected" }); }
        try { input.batches.forEach((batch) => assertRecordBelongsToJurisdiction({ entityType: "inventory_batch", jurisdictionId: batch.jurisdictionId }, assignment.jurisdictionId)); } catch (error) { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ERP policy validation rejected the request" }); }
        const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, assignment.jurisdictionId)).limit(1))[0];
        const pack = (await db.select().from(compliancePacks).where(and(eq(compliancePacks.jurisdictionId, assignment.jurisdictionId), eq(compliancePacks.status, "approved"))).orderBy(desc(compliancePacks.createdAt)).limit(1))[0];
        if (!profile || !pack) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Branch jurisdiction or approved compliance pack is unavailable" });
        const evidence = await db.select().from(complianceEvidence).where(and(eq(complianceEvidence.packId, pack.id), eq(complianceEvidence.verificationStatus, "verified")));
        const rules = JSON.parse(pack.rulesJson) as Record<string, boolean>;
        try {
          assertCompliancePackUsable({ countryCode: profile.countryCode, active: profile.active === 1, legalAuthorityProfile: profile.legalAuthorityProfile, language: profile.language, defaultLocale: profile.defaultLocale, currencyCode: profile.currencyCode, timezone: profile.timezone, taxProfile: profile.taxProfile, dateFormat: profile.dateFormat, numberSystem: profile.numberSystem }, { jurisdictionId: pack.jurisdictionId, packVersion: pack.packVersion, status: pack.status, effectiveFrom: pack.effectiveFrom, reviewDueAt: pack.reviewDueAt, rules, evidenceCount: evidence.length }, "sale");
        } catch (error) { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ERP policy validation rejected the request" }); }
        try { return { ...preparePosSale(input), jurisdictionId: assignment.jurisdictionId }; } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: "ERP policy validation rejected the request" }); }
      }),
    commitSale: protectedProcedure
      .input(z.object({ branchId: z.number().int().positive(), invoiceNumber: z.string().min(3).max(80), paymentMethod: z.enum(["cash", "meeza", "instapay", "insurance"]), discountAmount: z.number().nonnegative(), promotionCode: z.string().regex(/^[A-Z0-9_-]{3,48}$/).optional(), items: z.array(z.object({ productId: z.number().int().positive(), batchId: z.number().int().positive(), quantity: z.number().positive(), unit: z.string().min(1).max(24), unitPrice: z.number().nonnegative() })).min(1) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const assignment = (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, input.branchId)).limit(1))[0];
        try { assertBranchAssignmentReady(assignment); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, assignment.jurisdictionId); } catch (error) { throw new TRPCError({ code: error instanceof TRPCError ? error.code : "PRECONDITION_FAILED", message: "Scoped branch access rejected" }); }
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, assignment.jurisdictionId)).limit(1))[0];
        const pack = (await db.select().from(compliancePacks).where(and(eq(compliancePacks.jurisdictionId, assignment.jurisdictionId), eq(compliancePacks.status, "approved"))).orderBy(desc(compliancePacks.createdAt)).limit(1))[0];
        const evidence = pack ? await db.select().from(complianceEvidence).where(and(eq(complianceEvidence.packId, pack.id), eq(complianceEvidence.verificationStatus, "verified"))) : [];
        if (!profile || !pack) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Approved current sale compliance pack required" });
        try {
          const rules = JSON.parse(pack.rulesJson) as Record<string, boolean>;
          assertCompliancePackUsable({ countryCode: profile.countryCode, active: profile.active === 1, legalAuthorityProfile: profile.legalAuthorityProfile, language: profile.language, defaultLocale: profile.defaultLocale, currencyCode: profile.currencyCode, timezone: profile.timezone, taxProfile: profile.taxProfile, dateFormat: profile.dateFormat, numberSystem: profile.numberSystem }, { jurisdictionId: pack.jurisdictionId, packVersion: pack.packVersion, status: pack.status, effectiveFrom: pack.effectiveFrom, reviewDueAt: pack.reviewDueAt, rules, evidenceCount: evidence.length }, "sale");
        } catch (error) { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ERP policy validation rejected the request" }); }
        const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        let appliedPromotionId: number | null = null;
        if (input.promotionCode) {
          const promotion = (await db.select().from(promotions).where(and(eq(promotions.organizationId, organizationId), eq(promotions.jurisdictionId, assignment.jurisdictionId), eq(promotions.code, input.promotionCode), eq(promotions.status, "active"))).limit(1))[0];
          if (!promotion) throw new TRPCError({ code: "BAD_REQUEST", message: "Promotion is not available in this scope" });
          try {
            const evaluated = evaluatePromotion({ status: promotion.status, discountType: promotion.discountType, discountValue: Number(promotion.discountValue), startsAt: promotion.startsAt, endsAt: promotion.endsAt, usageLimit: promotion.usageLimit, usageCount: promotion.usageCount, now: new Date(), subtotal });
            if (Math.abs(evaluated.discountAmount - input.discountAmount) > 0.01) throw new Error("Promotion discount does not match the requested discount");
            appliedPromotionId = promotion.id;
          } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: "ERP policy validation rejected the request" }); }
        }
        const discount = enforceDiscount(subtotal, input.discountAmount);
        if (!discount.allowed) throw new TRPCError({ code: "BAD_REQUEST", message: discount.reason });
        const checkedItems: Array<{ productId: number; batchId: number; quantity: number; unit: string; unitPrice: number; remaining: number }> = [];
        for (const item of input.items) {
          const product = (await db.select().from(products).where(and(eq(products.id, item.productId), eq(products.organizationId, organizationId), eq(products.jurisdictionId, assignment.jurisdictionId))).limit(1))[0];
          const batch = (await db.select().from(inventoryBatches).where(and(eq(inventoryBatches.id, item.batchId), eq(inventoryBatches.organizationId, organizationId), eq(inventoryBatches.jurisdictionId, assignment.jurisdictionId))).limit(1))[0];
          if (!product || !batch || batch.branchId !== input.branchId || batch.productId !== item.productId || batch.jurisdictionId !== assignment.jurisdictionId || product.jurisdictionId !== assignment.jurisdictionId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Product or batch is outside the branch organization or jurisdiction" });
          if (!product.catalogItemId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Product requires a verified jurisdiction catalog record before regulated sale" });
          const catalogItem = (await db.select().from(catalogItems).where(and(eq(catalogItems.id, product.catalogItemId), eq(catalogItems.jurisdictionId, assignment.jurisdictionId), eq(catalogItems.organizationId, organizationId))).limit(1))[0];
          if (!catalogItem || catalogItem.verificationStatus !== "VERIFIED") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Catalog record is not verified for this jurisdiction" });
          const catalogEvidence = await db.select().from(complianceEvidence).where(and(eq(complianceEvidence.packId, pack.id), eq(complianceEvidence.jurisdictionId, assignment.jurisdictionId), eq(complianceEvidence.operation, "catalog"), eq(complianceEvidence.verificationStatus, "verified")));
          try { assertConsumableCatalogContext({ productCatalogItemId: product.catalogItemId, catalogItemId: catalogItem.id, productJurisdictionId: product.jurisdictionId, catalogJurisdictionId: catalogItem.jurisdictionId!, catalogStatus: catalogItem.verificationStatus === "VERIFIED" ? "approved" : catalogItem.verificationStatus === "REJECTED" ? "rejected" : "pending", category: catalogItem.category, item: catalogItem, evidence: catalogEvidence }); } catch (error) { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ERP policy validation rejected the request" }); }
          const remaining = Number(batch.quantityOnHand);
          if (!Number.isFinite(remaining) || remaining < item.quantity) throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient stock" });
          checkedItems.push({ ...item, remaining });
        }
        try {
          const result = await db.transaction(async (tx) => {
            const inserted = await tx.insert(sales).values({ organizationId, branchId: input.branchId, jurisdictionId: assignment.jurisdictionId, cashierId: ctx.user.id, invoiceNumber: input.invoiceNumber, subtotal: subtotal.toFixed(2), discountAmount: input.discountAmount.toFixed(2), totalAmount: (subtotal - input.discountAmount).toFixed(2), discountValidation: "MOH_7_PERCENT", paymentMethod: input.paymentMethod, etaStatus: "pending", saleStatus: "completed" });
            const saleId = Number(inserted[0].insertId);
            await tx.insert(saleItems).values(checkedItems.map((item) => ({ saleId, productId: item.productId, batchId: item.batchId, unit: item.unit, quantity: item.quantity.toFixed(3), unitPrice: item.unitPrice.toFixed(2) })));
            for (const item of checkedItems) { const updatedBatch = await tx.update(inventoryBatches).set({ quantityOnHand: (item.remaining - item.quantity).toFixed(3) }).where(and(eq(inventoryBatches.id, item.batchId), eq(inventoryBatches.organizationId, organizationId), eq(inventoryBatches.branchId, input.branchId), eq(inventoryBatches.jurisdictionId, assignment.jurisdictionId))).execute(); if (Number(updatedBatch[0]?.affectedRows ?? 0) !== 1) throw new Error("Inventory batch could not be reserved"); }
            if (appliedPromotionId !== null) {
              const updated = await tx.update(promotions).set({ usageCount: sql`${promotions.usageCount} + 1` }).where(and(eq(promotions.id, appliedPromotionId), eq(promotions.status, "active"), or(isNull(promotions.usageLimit), lt(promotions.usageCount, promotions.usageLimit)))).execute();
              if (Number(updated[0]?.affectedRows ?? 0) !== 1) throw new Error("Promotion usage could not be reserved");
            }
            return saleId;
          });
          return { saleId: result, jurisdictionId: assignment.jurisdictionId, status: "COMMITTED" as const };
        } catch (error) {
          console.error("[POS] Sale transaction rolled back", {
            error: safeErrorLabel(error),
            branchId: input.branchId,
            organizationId,
            jurisdictionId: assignment.jurisdictionId,
          });
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Sale could not be completed safely" });
        }
      }),
    previewReturn: protectedProcedure
      .input(z.object({ branchId: z.number().int().positive(), saleId: z.number().int().positive(), quantity: z.number().positive(), amount: z.number().nonnegative(), taxAmount: z.number().nonnegative().default(0), reason: z.enum(["defect", "wrong_item", "change_of_mind", "expired_or_damaged", "recall", "other"]), daysSinceSale: z.number().nonnegative(), itemSealed: z.boolean(), itemDispensed: z.boolean(), invoiceReferencePresent: z.boolean(), evidencePresent: z.boolean(), notes: z.string().max(500).optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const assignment = (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, input.branchId)).limit(1))[0];
        try { assertBranchAssignmentReady(assignment); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, assignment.jurisdictionId); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Scoped branch access rejected" }); }
        const organizationId = await getBranchOrganizationId(db, input.branchId); const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, assignment.jurisdictionId)).limit(1))[0];
        let rules: any = null; try { rules = profile?.taxProfile ? JSON.parse(profile.taxProfile) : null; } catch { rules = null; }
        const decision = assessConsumerReturn({ reason: input.reason, daysSinceSale: input.daysSinceSale, itemSealed: input.itemSealed, itemDispensed: input.itemDispensed, invoiceReferencePresent: input.invoiceReferencePresent, evidencePresent: input.evidencePresent }, rules?.returns ?? null);
        if (decision === "BLOCKED") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Return is not eligible under the verified jurisdiction policy" });
        const created = await db.insert(salesReturns).values({ organizationId, branchId: input.branchId, jurisdictionId: assignment.jurisdictionId, originalSaleId: input.saleId, quantity: input.quantity.toFixed(3), reasonCode: input.reason, disposition: decision === "REQUIRES_AUTHORITY_REVIEW" ? "pending_review" : "refund", status: "preview", amount: input.amount.toFixed(2), taxAmount: input.taxAmount.toFixed(2), notes: input.notes, createdByUserId: ctx.user.id });
        return { returnId: Number(created[0].insertId), decision, status: "PREVIEW" as const, jurisdictionId: assignment.jurisdictionId };
      }),
    issueLocalTaxInvoice: protectedProcedure
      .input(z.object({ branchId: z.number().int().positive(), saleId: z.number().int().positive().optional(), returnId: z.number().int().positive().optional(), invoiceNumber: z.string().min(3).max(80), invoiceType: z.enum(["sales", "credit_note", "debit_note"]), currencyCode: z.string().min(3).max(8), lines: z.array(z.object({ sku: z.string().min(1).max(80), quantity: z.number().positive(), unitPrice: z.number().nonnegative(), discountAmount: z.number().nonnegative().optional(), vatRate: z.number().min(0).max(100), exempt: z.boolean().default(false) })).min(1) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        if (!input.saleId && !input.returnId) throw new TRPCError({ code: "BAD_REQUEST", message: "Tax invoice must reference a sale or approved return" });
        const assignment = (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, input.branchId)).limit(1))[0];
        try { assertBranchAssignmentReady(assignment); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, assignment.jurisdictionId); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Scoped branch access rejected" }); }
        const organizationId = await getBranchOrganizationId(db, input.branchId); const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, assignment.jurisdictionId)).limit(1))[0];
        let tax: any = null; try { tax = profile?.taxProfile ? JSON.parse(profile.taxProfile) : null; } catch { tax = null; }
        try { assertVatInvoiceReady(tax); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Verified VAT registration and tax rules are required; official submission remains fail-closed" }); }
        let calculated; try { calculated = calculateVatInvoice(tax, input.lines.map(line => ({ sku: line.sku, quantity: line.quantity, unitPrice: line.unitPrice, discountAmount: line.discountAmount, vatRule: { code: "scope", rate: line.vatRate, exempt: line.exempt, verified: tax.ratesVerified } }))); } catch { throw new TRPCError({ code: "BAD_REQUEST", message: "Tax invoice calculation rejected the request" }); }
        const created = await db.insert(taxInvoices).values({ organizationId, branchId: input.branchId, jurisdictionId: assignment.jurisdictionId, saleId: input.saleId, returnId: input.returnId, invoiceNumber: input.invoiceNumber, invoiceType: input.invoiceType, currencyCode: calculated.currencyCode, subtotal: calculated.subtotal.toFixed(2), vatAmount: calculated.vatAmount.toFixed(2), totalAmount: calculated.total.toFixed(2), status: "issued_local", externalSubmissionGate: "not_configured", createdByUserId: ctx.user.id, issuedAt: new Date() });
        return { invoiceId: Number(created[0].insertId), status: "ISSUED_LOCAL" as const, externalSubmission: "BLOCKED_UNTIL_ETA_CREDENTIALS" as const, ...calculated };
      }),
    getTaxInvoiceTemplate: protectedProcedure
      .input(z.object({ branchId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const assignment = (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, input.branchId)).limit(1))[0];
        try { assertBranchAssignmentReady(assignment); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, assignment.jurisdictionId); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Scoped branch access rejected" }); }
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        const template = (await db.select().from(taxInvoiceTemplates).where(and(eq(taxInvoiceTemplates.organizationId, organizationId), eq(taxInvoiceTemplates.branchId, input.branchId), eq(taxInvoiceTemplates.jurisdictionId, assignment.jurisdictionId), eq(taxInvoiceTemplates.active, 1))).limit(1))[0];
        return template ?? { id: null, organizationId, branchId: input.branchId, jurisdictionId: assignment.jurisdictionId, nameAr: "قالب الفاتورة الضريبية", nameEn: "Tax Invoice Template", addressAr: null, addressEn: null, taxRegistrationNumber: null, phone: null, email: null, logoUrl: null, accentColor: "#0f766e", footerAr: "فاتورة ضريبية محلية - الإرسال الرسمي غير مفعّل", footerEn: "Local tax invoice - official submission is not enabled", active: 1 };
      }),
    saveTaxInvoiceTemplate: protectedProcedure
      .input(z.object({ branchId: z.number().int().positive(), nameAr: z.string().trim().min(1).max(160), nameEn: z.string().trim().min(1).max(160), addressAr: z.string().trim().max(500).optional(), addressEn: z.string().trim().max(500).optional(), taxRegistrationNumber: z.string().trim().max(80).optional(), phone: z.string().trim().max(40).optional(), email: z.string().email().max(160).optional().or(z.literal("")), logoUrl: z.string().url().max(1000).optional().or(z.literal("")), accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/), footerAr: z.string().trim().max(500).optional(), footerEn: z.string().trim().max(500).optional() }))
      .mutation(async ({ ctx, input }) => {
        if (!["admin", "manager"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Only administrators or managers can update invoice templates" });
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const assignment = (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, input.branchId)).limit(1))[0];
        try { assertBranchAssignmentReady(assignment); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, assignment.jurisdictionId); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Scoped branch access rejected" }); }
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        const values = { organizationId, branchId: input.branchId, jurisdictionId: assignment.jurisdictionId, nameAr: input.nameAr, nameEn: input.nameEn, addressAr: input.addressAr || null, addressEn: input.addressEn || null, taxRegistrationNumber: input.taxRegistrationNumber || null, phone: input.phone || null, email: input.email || null, logoUrl: input.logoUrl || null, accentColor: input.accentColor, footerAr: input.footerAr || null, footerEn: input.footerEn || null, active: 1, updatedByUserId: ctx.user.id };
        const existing = (await db.select().from(taxInvoiceTemplates).where(and(eq(taxInvoiceTemplates.organizationId, organizationId), eq(taxInvoiceTemplates.branchId, input.branchId), eq(taxInvoiceTemplates.jurisdictionId, assignment.jurisdictionId))).limit(1))[0];
        let templateId: number;
        if (existing) { await db.update(taxInvoiceTemplates).set(values).where(and(eq(taxInvoiceTemplates.id, existing.id), eq(taxInvoiceTemplates.organizationId, organizationId), eq(taxInvoiceTemplates.branchId, input.branchId), eq(taxInvoiceTemplates.jurisdictionId, assignment.jurisdictionId))); templateId = existing.id; }
        else { const created = await db.insert(taxInvoiceTemplates).values(values); templateId = Number(created[0].insertId); }
        const createdAt = new Date().toISOString(); const recordHash = hashAuditRecord({ eventType: "tax_invoice_template_updated", userId: ctx.user.id, organizationId, branchId: input.branchId, jurisdictionId: assignment.jurisdictionId, requestId: String(templateId), createdAt });
        await db.insert(auditLogs).values({ userId: ctx.user.id, organizationId, branchId: input.branchId, action: "tax_invoice_template_updated", entityType: "tax_invoice_template", entityId: String(templateId), previousHash: null, recordHash });
        return { templateId, status: "SAVED" as const };
      }),
  }),
  schedule: router({
    createDailyInventoryAlerts: protectedProcedure
      .input(z.object({ cron: z.string().regex(/^\d+ \S+ \S+ \S+ \S+ \S+$/).default("0 0 6 * * *") }))
      .mutation(async ({ ctx, input }) => {
        if (!["admin", "manager"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Only administrators or managers can create schedules" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const name = "bdf-inventory-alerts-daily";
        const existing = (await db.select().from(scheduledJobs).where(eq(scheduledJobs.name, name)).limit(1))[0];
        if (existing?.scheduleCronTaskUid) return { taskUid: existing.scheduleCronTaskUid, reused: true };
        const session = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
        const job = await createHeartbeatJob({ name, cron: input.cron, path: "/api/scheduled/inventory-alerts", method: "POST", description: "Daily FEFO reorder and expiry alerts for branch managers" }, session);
        if (existing) await db.update(scheduledJobs).set({ scheduleCronTaskUid: job.taskUid, cronExpression: input.cron, active: 1 }).where(eq(scheduledJobs.id, existing.id));
        else await db.insert(scheduledJobs).values({ name, scheduleCronTaskUid: job.taskUid, cronExpression: input.cron, active: 1 });
        return { taskUid: job.taskUid, nextExecutionAt: job.nextExecutionAt ?? null, reused: false };
      }),
  }),
  prescription: router({
    upload: pharmacistProcedure
      .input(z.object({ branchId: z.number().int().positive(), fileName: z.string().min(1).max(160), mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]), dataUrl: z.string().regex(/^data:image\/(jpeg|png|webp);base64,/), }))
      .mutation(async ({ ctx, input }) => {
        const raw = input.dataUrl.split(",", 2)[1] ?? "";
        const bytes = Buffer.from(raw, "base64");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const assignment = (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, input.branchId)).limit(1))[0];
        try { assertBranchAssignmentReady(assignment); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, assignment.jurisdictionId); } catch (error) { throw new TRPCError({ code: error instanceof TRPCError ? error.code : "PRECONDITION_FAILED", message: "Scoped branch access rejected" }); }
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, assignment.jurisdictionId)).limit(1))[0];
        const pack = (await db.select().from(compliancePacks).where(and(eq(compliancePacks.jurisdictionId, assignment.jurisdictionId), eq(compliancePacks.status, "approved"))).orderBy(desc(compliancePacks.createdAt)).limit(1))[0];
        if (!profile || !pack) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Branch requires an approved current jurisdiction pack" });
        const evidence = await db.select().from(complianceEvidence).where(and(eq(complianceEvidence.packId, pack.id), eq(complianceEvidence.verificationStatus, "verified")));
        try { assertCompliancePackUsable({ countryCode: profile.countryCode, active: profile.active === 1, legalAuthorityProfile: profile.legalAuthorityProfile, language: profile.language, defaultLocale: profile.defaultLocale, currencyCode: profile.currencyCode, timezone: profile.timezone, taxProfile: profile.taxProfile, dateFormat: profile.dateFormat, numberSystem: profile.numberSystem }, { jurisdictionId: pack.jurisdictionId, packVersion: pack.packVersion, status: pack.status, effectiveFrom: pack.effectiveFrom, reviewDueAt: pack.reviewDueAt, rules: JSON.parse(pack.rulesJson) as Record<string, boolean>, evidenceCount: evidence.length }, "prescription");         } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Prescription compliance policy rejected the request" }); }
        try { validatePrescriptionUpload({ mimeType: input.mimeType, byteLength: bytes.length, bytes }); } catch { throw new TRPCError({ code: "BAD_REQUEST", message: "ERP policy validation rejected the request" }); }
        const stored = await storagePut(`prescriptions/${ctx.user.id}/${input.fileName}`, bytes, input.mimeType);
        const inserted = await db.insert(prescriptionIntakes).values({ organizationId, branchId: input.branchId, jurisdictionId: assignment.jurisdictionId, createdByUserId: ctx.user.id, imageKey: stored.key, imageMimeType: input.mimeType, status: "UPLOADED" });
        return { intakeId: Number(inserted[0].insertId), key: stored.key, status: "UPLOADED" as const };
      }),
    extractFromIntake: pharmacistProcedure
      .input(z.object({ intakeId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const intake = (await db.select().from(prescriptionIntakes).where(eq(prescriptionIntakes.id, input.intakeId)).limit(1))[0];
        if (!intake) throw new TRPCError({ code: "NOT_FOUND", message: "Prescription intake not found" });
        const assignment = intake.branchId ? (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, intake.branchId)).limit(1))[0] : undefined;
        if (!intake.organizationId || !intake.branchId || (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(intake.organizationId))) throw new TRPCError({ code: "FORBIDDEN", message: "Prescription intake is outside the active organization scope" });
        try { assertBranchAssignmentReady(assignment); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, intake.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, assignment.jurisdictionId); } catch (error) { throw new TRPCError({ code: error instanceof TRPCError ? error.code : "PRECONDITION_FAILED", message: "Scoped branch access rejected" }); }
        try { assertRecordBelongsToJurisdiction({ entityType: "prescription", jurisdictionId: intake.jurisdictionId }, assignment.jurisdictionId); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Prescription jurisdiction mismatch" }); }
        const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, assignment.jurisdictionId)).limit(1))[0];
        const pack = (await db.select().from(compliancePacks).where(and(eq(compliancePacks.jurisdictionId, assignment.jurisdictionId), eq(compliancePacks.status, "approved"))).orderBy(desc(compliancePacks.createdAt)).limit(1))[0];
        const evidence = pack ? await db.select().from(complianceEvidence).where(and(eq(complianceEvidence.packId, pack.id), eq(complianceEvidence.verificationStatus, "verified"))) : [];
        if (!profile || !pack) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Approved current prescription pack required" });
        try { assertCompliancePackUsable({ countryCode: profile.countryCode, active: profile.active === 1, legalAuthorityProfile: profile.legalAuthorityProfile, language: profile.language, defaultLocale: profile.defaultLocale, currencyCode: profile.currencyCode, timezone: profile.timezone, taxProfile: profile.taxProfile, dateFormat: profile.dateFormat, numberSystem: profile.numberSystem }, { jurisdictionId: pack.jurisdictionId, packVersion: pack.packVersion, status: pack.status, effectiveFrom: pack.effectiveFrom, reviewDueAt: pack.reviewDueAt, rules: JSON.parse(pack.rulesJson) as Record<string, boolean>, evidenceCount: evidence.length }, "prescription"); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Prescription compliance policy rejected the request" }); }
        const imageUrl = await storageGetSignedUrl(intake.imageKey);
        const result = await invokeLLM({
          model: "gemini-3-flash-preview",
          messages: [{ role: "user", content: [
            { type: "text", text: "اقرأ صورة هذه الوصفة الطبية وفق ملف الدولة المرتبط بالفرع. استخرج النص الدوائي فقط، ولا تخمّن أسماء غير واضحة. أعد ثقة منخفضة عند عدم اليقين. النتائج تحتاج مراجعة صيدلي ولا تمثل قرار صرف." },
            { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
          ] }],
          response_format: {
            type: "json_schema", json_schema: { name: "prescription_extraction", strict: true, schema: { type: "object", properties: { items: { type: "array", items: { type: "object", properties: { detectedText: { type: "string" }, dosage: { type: "string" }, quantity: { type: "string" }, confidence: { type: "number" } }, required: ["detectedText", "dosage", "quantity", "confidence"], additionalProperties: false } }, overallConfidence: { type: "number" }, requiresPharmacistReview: { type: "boolean" } }, required: ["items", "overallConfidence", "requiresPharmacistReview"], additionalProperties: false } },
          },
        });
        const content = result.choices?.[0]?.message?.content;
        if (typeof content !== "string") throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Vision model returned no structured result" });
        const extraction = JSON.parse(content);
        await db.update(prescriptionIntakes).set({ extractionJson: content, status: "PENDING_REVIEW" }).where(eq(prescriptionIntakes.id, intake.id));
        return { intakeId: intake.id, extraction, status: "PENDING_REVIEW" as const, reviewedBy: ctx.user.id };
      }),
    confirm: pharmacistProcedure
      .input(z.object({ intakeId: z.number().int().positive(), approved: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const intake = (await db.select().from(prescriptionIntakes).where(eq(prescriptionIntakes.id, input.intakeId)).limit(1))[0];
        if (!intake) throw new TRPCError({ code: "NOT_FOUND", message: "Prescription intake not found" });
        const assignment = intake.branchId ? (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, intake.branchId)).limit(1))[0] : undefined;
        if (!intake.organizationId || !intake.branchId || (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(intake.organizationId))) throw new TRPCError({ code: "FORBIDDEN", message: "Prescription intake is outside the active organization scope" });
        try { assertBranchAssignmentReady(assignment); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, intake.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, assignment.jurisdictionId); } catch (error) { throw new TRPCError({ code: error instanceof TRPCError ? error.code : "PRECONDITION_FAILED", message: "Scoped branch access rejected" }); }
        try { assertRecordBelongsToJurisdiction({ entityType: "prescription", jurisdictionId: intake.jurisdictionId }, assignment.jurisdictionId); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Prescription jurisdiction mismatch" }); }
        const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, assignment.jurisdictionId)).limit(1))[0];
        const pack = (await db.select().from(compliancePacks).where(and(eq(compliancePacks.jurisdictionId, assignment.jurisdictionId), eq(compliancePacks.status, "approved"))).orderBy(desc(compliancePacks.createdAt)).limit(1))[0];
        const evidence = pack ? await db.select().from(complianceEvidence).where(and(eq(complianceEvidence.packId, pack.id), eq(complianceEvidence.verificationStatus, "verified"))) : [];
        if (!profile || !pack) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Approved current prescription review pack required" });
        try { assertCompliancePackUsable({ countryCode: profile.countryCode, active: profile.active === 1, legalAuthorityProfile: profile.legalAuthorityProfile, language: profile.language, defaultLocale: profile.defaultLocale, currencyCode: profile.currencyCode, timezone: profile.timezone, taxProfile: profile.taxProfile, dateFormat: profile.dateFormat, numberSystem: profile.numberSystem }, { jurisdictionId: pack.jurisdictionId, packVersion: pack.packVersion, status: pack.status, effectiveFrom: pack.effectiveFrom, reviewDueAt: pack.reviewDueAt, rules: JSON.parse(pack.rulesJson) as Record<string, boolean>, evidenceCount: evidence.length }, "prescription"); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Prescription compliance policy rejected the request" }); }
        const status = input.approved ? "CONFIRMED" : "REJECTED";
        await db.update(prescriptionIntakes).set({ status }).where(and(eq(prescriptionIntakes.id, intake.id), eq(prescriptionIntakes.jurisdictionId, assignment.jurisdictionId)));
        return { intakeId: intake.id, status, confirmedBy: ctx.user.id };
      }),
    dispense: pharmacistProcedure
      .input(z.object({ intakeId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const intake = (await db.select().from(prescriptionIntakes).where(eq(prescriptionIntakes.id, input.intakeId)).limit(1))[0];
        if (!intake) throw new TRPCError({ code: "NOT_FOUND", message: "Prescription intake not found" });
        const assignment = intake.branchId ? (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, intake.branchId)).limit(1))[0] : undefined;
        if (!intake.organizationId || !intake.branchId || (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(intake.organizationId))) throw new TRPCError({ code: "FORBIDDEN", message: "Prescription intake is outside the active organization scope" });
        try { assertBranchAssignmentReady(assignment); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, intake.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, assignment.jurisdictionId); } catch (error) { throw new TRPCError({ code: error instanceof TRPCError ? error.code : "PRECONDITION_FAILED", message: "Scoped branch access rejected" }); }
        try { assertRecordBelongsToJurisdiction({ entityType: "prescription", jurisdictionId: intake.jurisdictionId }, assignment.jurisdictionId); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Prescription jurisdiction mismatch" }); }
        const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, assignment.jurisdictionId)).limit(1))[0];
        const pack = (await db.select().from(compliancePacks).where(and(eq(compliancePacks.jurisdictionId, assignment.jurisdictionId), eq(compliancePacks.status, "approved"))).orderBy(desc(compliancePacks.createdAt)).limit(1))[0];
        const evidence = pack ? await db.select().from(complianceEvidence).where(and(eq(complianceEvidence.packId, pack.id), eq(complianceEvidence.verificationStatus, "verified"))) : [];
        if (!profile || !pack) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Approved current dispensing pack required" });
        try { assertCompliancePackUsable({ countryCode: profile.countryCode, active: profile.active === 1, legalAuthorityProfile: profile.legalAuthorityProfile, language: profile.language, defaultLocale: profile.defaultLocale, currencyCode: profile.currencyCode, timezone: profile.timezone, taxProfile: profile.taxProfile, dateFormat: profile.dateFormat, numberSystem: profile.numberSystem }, { jurisdictionId: pack.jurisdictionId, packVersion: pack.packVersion, status: pack.status, effectiveFrom: pack.effectiveFrom, reviewDueAt: pack.reviewDueAt, rules: JSON.parse(pack.rulesJson) as Record<string, boolean>, evidenceCount: evidence.length }, "dispensing"); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Dispensing compliance policy rejected the request" }); }
        try { assertPrescriptionConfirmed(intake.status); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Prescription must be confirmed before dispensing" }); }
        return { allowed: true, intakeId: intake.id, nextStep: "CREATE_SALE_WITH_FEFO" as const };
      }),
    extract: pharmacistProcedure
      .input(z.object({ imageUrl: z.string().url().or(z.string().startsWith("data:image/")) }))
      .mutation(async ({ input }) => {
        void input;
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Direct prescription extraction is disabled; use a branch-bound prescription intake" });

      }),
  }),
  customerCare: router({
    list: customerCareProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const branchIds = await getUserBranchIds(db, ctx.user.id, ctx.user.role);
      const organizationIds = ctx.user.role === "admin" ? null : await getUserOrganizationIds(db, ctx.user.id);
      const filters = [branchIds === null ? undefined : branchIds.length ? inArray(customerProfiles.branchId, branchIds) : eq(customerProfiles.id, -1), organizationIds === null ? undefined : organizationIds.length ? inArray(customerProfiles.organizationId, organizationIds) : eq(customerProfiles.id, -1)].filter(Boolean) as any[];
      return db.select().from(customerProfiles).where(filters.length ? and(...filters) : undefined).orderBy(desc(customerProfiles.updatedAt)).limit(100);
    }),
    create: customerCareProcedure
      .input(z.object({ fullName: z.string().min(2).max(220), phone: z.string().min(7).max(40), consentStatus: z.enum(["pending", "granted", "withdrawn"]).default("pending"), chronicCareEnabled: z.boolean().default(false), notes: z.string().max(4000).optional(), branchId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId);
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        const inserted = await db.insert(customerProfiles).values({ ...input, organizationId, chronicCareEnabled: input.chronicCareEnabled ? 1 : 0, createdByUserId: ctx.user.id });
        return { customerId: Number(inserted[0].insertId) };
      }),
    addInteraction: customerCareProcedure
      .input(z.object({ customerId: z.number().int().positive(), interactionType: z.enum(["follow_up", "complaint", "counseling", "chronic_care"]), summary: z.string().min(3).max(6000), nextActionAt: z.coerce.date().optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const customer = (await db.select({ branchId: customerProfiles.branchId, organizationId: customerProfiles.organizationId }).from(customerProfiles).where(eq(customerProfiles.id, input.customerId)).limit(1))[0];
        if (!customer) throw new TRPCError({ code: "NOT_FOUND", message: "Customer profile not found" });
        if (!customer.organizationId || (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(customer.organizationId))) throw new TRPCError({ code: "FORBIDDEN", message: "Customer profile is outside the active organization scope" });
        if (customer.branchId === null) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Customer profile has no branch assignment" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, customer.branchId);
        const inserted = await db.insert(careInteractions).values({ ...input, userId: ctx.user.id });
        return { interactionId: Number(inserted[0].insertId) };
      }),
  }),
  callCentre: router({
    list: customerCareProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const branchIds = await getUserBranchIds(db, ctx.user.id, ctx.user.role);
      const organizationIds = ctx.user.role === "admin" ? null : await getUserOrganizationIds(db, ctx.user.id);
      const filters = [branchIds === null ? undefined : branchIds.length ? inArray(callTickets.branchId, branchIds) : eq(callTickets.id, -1), organizationIds === null ? undefined : organizationIds.length ? inArray(callTickets.organizationId, organizationIds) : eq(callTickets.id, -1)].filter(Boolean) as any[];
      return db.select().from(callTickets).where(filters.length ? and(...filters) : undefined).orderBy(desc(callTickets.updatedAt)).limit(100);
    }),
    create: customerCareProcedure
      .input(z.object({ subject: z.string().min(2).max(220), channel: z.enum(["phone", "whatsapp", "web", "in_person"]), direction: z.enum(["inbound", "outbound"]), priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"), customerId: z.number().int().positive().optional(), branchId: z.number().int().positive(), callbackAt: z.coerce.date().optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId);
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        if (input.customerId !== undefined) {
          const customer = (await db.select({ branchId: customerProfiles.branchId, organizationId: customerProfiles.organizationId }).from(customerProfiles).where(eq(customerProfiles.id, input.customerId)).limit(1))[0];
          if (!customer) throw new TRPCError({ code: "NOT_FOUND", message: "Customer profile not found" });
          try {
            assertCustomerTicketScope({ ticketOrganizationId: organizationId, ticketBranchId: input.branchId, customerOrganizationId: customer.organizationId, customerBranchId: customer.branchId });
          } catch (error) {
            throw new TRPCError({ code: "FORBIDDEN", message: "ERP policy validation rejected the request" });
          }
        }
        const inserted = await db.insert(callTickets).values({ ...input, organizationId, createdByUserId: ctx.user.id });
        return { ticketId: Number(inserted[0].insertId), status: "open" as const };
      }),
    updateStatus: customerCareProcedure
      .input(z.object({ ticketId: z.number().int().positive(), status: z.enum(["open", "pending", "resolved", "closed"]), disposition: z.string().max(120).optional(), assignedUserId: z.number().int().positive().optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const ticket = (await db.select({ branchId: callTickets.branchId, organizationId: callTickets.organizationId }).from(callTickets).where(eq(callTickets.id, input.ticketId)).limit(1))[0];
        if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Call ticket not found" });
        if (!ticket.organizationId || (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(ticket.organizationId))) throw new TRPCError({ code: "FORBIDDEN", message: "Call ticket is outside the active organization scope" });
        if (ticket.branchId === null) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Call ticket has no branch assignment" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, ticket.branchId);
        if (input.assignedUserId !== undefined) {
          const assigneeMembership = (await db.select({ organizationId: organizationMemberships.organizationId }).from(organizationMemberships).where(and(eq(organizationMemberships.userId, input.assignedUserId), eq(organizationMemberships.organizationId, ticket.organizationId), eq(organizationMemberships.active, 1))).limit(1))[0];
          const assigneeBranch = (await db.select({ branchId: branchUsers.branchId }).from(branchUsers).where(and(eq(branchUsers.userId, input.assignedUserId), eq(branchUsers.branchId, ticket.branchId), eq(branchUsers.active, 1))).limit(1))[0];
          try {
            assertAssigneeScope({ ticketOrganizationId: ticket.organizationId, ticketBranchId: ticket.branchId, assigneeOrganizationId: assigneeMembership?.organizationId, assigneeBranchId: assigneeBranch?.branchId });
          } catch (error) {
            throw new TRPCError({ code: "FORBIDDEN", message: "ERP policy validation rejected the request" });
          }
        }
        const { ticketId, ...changes } = input;
        await db.update(callTickets).set(buildCallTicketUpdate(changes)).where(eq(callTickets.id, ticketId));
        return { success: true } as const;
      }),
  }),
  offlineDrafts: router({
    listMine: customerCareProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      return db.select().from(offlineDrafts).where(eq(offlineDrafts.createdByUserId, ctx.user.id)).orderBy(desc(offlineDrafts.updatedAt)).limit(50);
    }),
    enqueue: customerCareProcedure
      .input(z.object({ idempotencyKey: z.string().min(8).max(120), module: z.enum(["customerCare", "callCentre"]), payload: z.unknown() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const payload = input.module === "customerCare" ? customerCareDraftSchema.parse(input.payload) : callCentreDraftSchema.parse(input.payload);
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, payload.branchId);
        const existing = (await db.select().from(offlineDrafts).where(eq(offlineDrafts.idempotencyKey, input.idempotencyKey)).limit(1))[0];
        if (existing) {
          if (existing.createdByUserId !== ctx.user.id) throw new TRPCError({ code: "CONFLICT", message: "Idempotency key belongs to another user" });
          return { draftId: existing.id, status: existing.status, duplicate: true };
        }
        const inserted = await db.insert(offlineDrafts).values({ idempotencyKey: input.idempotencyKey, module: input.module, payloadJson: JSON.stringify(payload), createdByUserId: ctx.user.id });
        return { draftId: Number(inserted[0].insertId), status: "queued" as const, duplicate: false };
      }),
    replay: customerCareProcedure
      .input(z.object({
        draftId: z.number().int().positive(),
        deviceTrust: z.object({
          deviceIdentityVerified: z.boolean(),
          localStorageEncrypted: z.boolean(),
          supportedAppVersion: z.boolean(),
          screenLockAssured: z.boolean(),
          deviceRevocationChecked: z.boolean(),
          sessionScopeVerified: z.boolean(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try { assertDeviceTrustReady(input.deviceTrust ?? null); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Trusted device required for offline replay" }); }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const draft = (await db.select().from(offlineDrafts).where(and(eq(offlineDrafts.id, input.draftId), eq(offlineDrafts.createdByUserId, ctx.user.id))).limit(1))[0];
        if (!draft) throw new TRPCError({ code: "NOT_FOUND", message: "Offline draft not found" });
        if (draft.status === "replayed") return { draftId: draft.id, status: draft.status, entityId: draft.replayedEntityId, duplicate: true };
        if (draft.status !== "queued") throw new TRPCError({ code: "CONFLICT", message: "Draft requires manual review before replay" });
        const payload: unknown = JSON.parse(draft.payloadJson);
        try {
          if (draft.module === "customerCare") {
            const parsed = customerCareDraftSchema.parse(payload);
            await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, parsed.branchId);
            const organizationId = await getBranchOrganizationId(db, parsed.branchId);
            const inserted = await db.insert(customerProfiles).values({ ...parsed, organizationId, chronicCareEnabled: parsed.chronicCareEnabled ? 1 : 0, createdByUserId: ctx.user.id });
            const entityId = Number(inserted[0].insertId);
            await db.update(offlineDrafts).set({ status: "replayed", replayedEntityId: entityId, errorCode: null }).where(eq(offlineDrafts.id, draft.id));
            return { draftId: draft.id, status: "replayed" as const, entityId, duplicate: false };
          }
          const parsed = callCentreDraftSchema.parse(payload);
          await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, parsed.branchId);
          const organizationId = await getBranchOrganizationId(db, parsed.branchId);
          if (parsed.customerId !== undefined) {
            const customer = (await db.select({ branchId: customerProfiles.branchId, organizationId: customerProfiles.organizationId }).from(customerProfiles).where(eq(customerProfiles.id, parsed.customerId)).limit(1))[0];
            if (!customer) throw new TRPCError({ code: "NOT_FOUND", message: "Customer profile not found" });
            assertCustomerTicketScope({ ticketOrganizationId: organizationId, ticketBranchId: parsed.branchId, customerOrganizationId: customer.organizationId, customerBranchId: customer.branchId });
          }
          const inserted = await db.insert(callTickets).values({ ...parsed, organizationId, createdByUserId: ctx.user.id });
          const entityId = Number(inserted[0].insertId);
          await db.update(offlineDrafts).set({ status: "replayed", replayedEntityId: entityId, errorCode: null }).where(eq(offlineDrafts.id, draft.id));
          return { draftId: draft.id, status: "replayed" as const, entityId, duplicate: false };
        } catch (error) {
          await db.update(offlineDrafts).set({ status: "failed", errorCode: "REPLAY_VALIDATION_FAILED" }).where(eq(offlineDrafts.id, draft.id));
          throw new TRPCError({ code: "BAD_REQUEST", message: "ERP policy validation rejected the request" });
        }
      }),
  }),
  catalog: router({
    reviewQueue: catalogEditorProcedure
      .input(z.object({ jurisdictionId: z.number().int().positive(), category: z.enum(["medicine", "cosmetic", "medical_supply"]).optional(), status: z.enum(["UNVERIFIED", "PENDING_REVIEW", "VERIFIED", "REJECTED"]).default("PENDING_REVIEW"), query: z.string().max(120).default("") }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, input.jurisdictionId);
        const organizationIds = ctx.user.role === "admin" ? null : await getUserOrganizationIds(db, ctx.user.id);
        const filters = [eq(catalogItems.jurisdictionId, input.jurisdictionId), eq(catalogItems.verificationStatus, input.status), ...(input.category ? [eq(catalogItems.category, input.category)] : []), ...(input.query ? [or(like(catalogItems.nameAr, `%${input.query}%`), like(catalogItems.nameEn, `%${input.query}%`), like(catalogItems.sku, `%${input.query}%`))] : []), ...(organizationIds ? [organizationIds.length ? inArray(catalogItems.organizationId, organizationIds) : eq(catalogItems.id, -1)] : [])];
        return db.select({ id: catalogItems.id, category: catalogItems.category, sku: catalogItems.sku, barcode: catalogItems.barcode, nameAr: catalogItems.nameAr, nameEn: catalogItems.nameEn, genericName: catalogItems.genericName, manufacturer: catalogItems.manufacturer, sourceAuthority: catalogItems.sourceAuthority, sourceRecordId: catalogItems.sourceRecordId, sourceUrl: catalogItems.sourceUrl, sourceRetrievedAt: catalogItems.sourceRetrievedAt, verificationStatus: catalogItems.verificationStatus, organizationId: catalogItems.organizationId, jurisdictionId: catalogItems.jurisdictionId, createdAt: catalogItems.createdAt, updatedAt: catalogItems.updatedAt }).from(catalogItems).where(and(...filters)).orderBy(desc(catalogItems.updatedAt)).limit(200);
      }),
    bulkDryRun: catalogEditorProcedure
      .input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), rows: z.array(z.record(z.string(), z.unknown())).min(1).max(2000) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        await assertCatalogImportScope(db, ctx.user.id, ctx.user.role, input);
        const normalized = input.rows.map((raw, index) => ({ index: index + 1, ...normalizeCatalogImportRow(raw) }));
        const valid = normalized.filter(item => item.row).map(item => ({ index: item.index, row: item.row! }));
        const issues: Array<{ rowNumber: number; severity: "error" | "conflict"; code: string; message: string; existingId?: number }> = normalized.filter(item => item.errors.length).map(item => ({ rowNumber: item.index, severity: "error", code: "INVALID_ROW", message: item.errors.join("، ") }));
        const skuCounts = new Map<string, number>(); valid.forEach(item => skuCounts.set(item.row.sku, (skuCounts.get(item.row.sku) ?? 0) + 1));
        valid.filter(item => (skuCounts.get(item.row.sku) ?? 0) > 1).forEach(item => issues.push({ rowNumber: item.index, severity: "conflict", code: "DUPLICATE_INPUT_SKU", message: `SKU مكرر داخل الملف: ${item.row.sku}` }));
        const skus = Array.from(new Set(valid.map(item => item.row.sku)));
        const existing = skus.length ? await db.select({ id: catalogItems.id, sku: catalogItems.sku, organizationId: catalogItems.organizationId, verificationStatus: catalogItems.verificationStatus }).from(catalogItems).where(and(inArray(catalogItems.sku, skus), eq(catalogItems.organizationId, input.organizationId), eq(catalogItems.jurisdictionId, input.jurisdictionId))) : [];
        const existingBySku = new Map(existing.map(item => [item.sku, item]));
        valid.forEach(item => { const found = existingBySku.get(item.row.sku); if (found) issues.push({ rowNumber: item.index, severity: "conflict", code: "EXISTING_SKU", message: `SKU موجود مسبقاً (سجل ${found.id})`, existingId: found.id }); });
        const digest = catalogDryRunDigest({ organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, rows: input.rows });
        const expiresAt = Date.now() + 10 * 60 * 1000;
        return { dryRunToken: signCatalogDryRun({ organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, digest, expiresAt }), expiresAt, totals: { received: input.rows.length, valid: valid.length, errors: issues.filter(issue => issue.severity === "error").length, conflicts: issues.filter(issue => issue.severity === "conflict").length, importable: Math.max(0, valid.length - issues.filter(issue => issue.severity === "conflict").length) }, issues: issues.slice(0, 500), provenancePolicy: "PENDING_REVIEW", scope: { organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId } };
      }),
    bulkConfirm: catalogEditorProcedure
      .input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), rows: z.array(z.record(z.string(), z.unknown())).min(1).max(2000), dryRunToken: z.string().min(80).max(400), acknowledgePendingReview: z.literal(true) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        await assertCatalogImportScope(db, ctx.user.id, ctx.user.role, input);
        const digest = catalogDryRunDigest({ organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, rows: input.rows });
        if (!verifyCatalogDryRunToken(input.dryRunToken, { organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, digest })) throw new TRPCError({ code: "CONFLICT", message: "Dry-run expired or does not match the submitted file and scope" });
        const normalized = input.rows.map((raw, index) => ({ index: index + 1, ...normalizeCatalogImportRow(raw) }));
        if (normalized.some(item => !item.row || item.errors.length)) throw new TRPCError({ code: "CONFLICT", message: "Dry-run contains invalid rows; run it again after correction" });
        const valid = normalized.map(item => ({ index: item.index, row: item.row! }));
        const skus = valid.map(item => item.row.sku); const existing = skus.length ? await db.select({ id: catalogItems.id, sku: catalogItems.sku }).from(catalogItems).where(and(inArray(catalogItems.sku, skus), eq(catalogItems.organizationId, input.organizationId), eq(catalogItems.jurisdictionId, input.jurisdictionId))) : [];
        if (existing.length) throw new TRPCError({ code: "CONFLICT", message: `لا يمكن التأكيد: توجد ${existing.length} تعارضات SKU. أعد المحاكاة.` });
        const insertedIds: number[] = [];
        for (const item of valid) {
          const row = item.row; const inserted = await db.insert(catalogItems).values({ jurisdictionId: input.jurisdictionId, organizationId: input.organizationId, category: row.category, sku: row.sku, barcode: row.barcode || null, gtin: row.gtin || null, priceEgp: row.priceEgp === undefined ? null : String(row.priceEgp), nameAr: row.nameAr, nameEn: row.nameEn || null, genericName: row.genericName || null, manufacturer: row.manufacturer || null, registrationNumber: row.registrationNumber || null, sourceAuthority: row.sourceAuthority, sourceRecordId: row.sourceRecordId || null, sourceUrl: row.sourceUrl || null, sourceRetrievedAt: row.sourceRetrievedAt || new Date(), sourceLicense: row.sourceLicense || null, sourceNotes: row.sourceNotes || null, verificationStatus: "PENDING_REVIEW", createdByUserId: ctx.user.id });
          const itemId = Number(inserted[0].insertId); insertedIds.push(itemId);
          await db.insert(catalogSyncQueue).values({ jurisdictionId: input.jurisdictionId, organizationId: input.organizationId, entityType: row.category, operation: "create", entityId: itemId, idempotencyKey: `catalog-bulk-${input.organizationId}-${input.jurisdictionId}-${createHash("sha256").update(`${row.sku}:${row.sourceRecordId ?? ""}`).digest("hex").slice(0, 56)}`, payloadJson: JSON.stringify({ ...row, priceEgp: row.priceEgp ?? null, sourceRetrievedAt: row.sourceRetrievedAt?.toISOString() ?? null }), createdByUserId: ctx.user.id });
        }
        const createdAt = new Date().toISOString(); const recordHash = hashAuditRecord({ eventType: "catalog_bulk_import_confirmed", userId: ctx.user.id, organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, requestId: digest, createdAt });
        await db.insert(auditLogs).values({ userId: ctx.user.id, organizationId: input.organizationId, branchId: input.branchId, action: "catalog_bulk_import_confirmed", entityType: "catalog_bulk_import", entityId: digest, previousHash: null, recordHash });
        return { imported: insertedIds.length, itemIds: insertedIds, status: "PENDING_REVIEW" as const, scope: { organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId } };
      }),
    search: protectedProcedure
      .input(z.object({ jurisdictionId: z.number().int().positive(), query: z.string().max(120).default(""), category: z.enum(["medicine", "cosmetic", "medical_supply"]).optional() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, input.jurisdictionId)).limit(1))[0];
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Jurisdiction not found" });
        try { await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, input.jurisdictionId); } catch (error) { throw new TRPCError({ code: error instanceof TRPCError ? error.code : "FORBIDDEN", message: "ERP policy validation rejected the request" }); }
        try { assertJurisdictionProfileReady({ countryCode: profile.countryCode, active: profile.active === 1, legalAuthorityProfile: profile.legalAuthorityProfile, language: profile.language, defaultLocale: profile.defaultLocale, currencyCode: profile.currencyCode, timezone: profile.timezone, taxProfile: profile.taxProfile, dateFormat: profile.dateFormat, numberSystem: profile.numberSystem }); } catch (error) { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ERP policy validation rejected the request" }); }
        const filters = [];
        if (input.query) filters.push(like(catalogItems.nameAr, `%${input.query}%`));
        filters.push(eq(catalogItems.jurisdictionId, input.jurisdictionId));
        if (input.category) filters.push(eq(catalogItems.category, input.category));
        if (ctx.user.role !== "admin") {
          const organizationIds = await getUserOrganizationIds(db, ctx.user.id);
          filters.push(organizationIds.length ? inArray(catalogItems.organizationId, organizationIds) : eq(catalogItems.id, -1));
        }
        const rows = await db.select().from(catalogItems).where(and(...filters)).orderBy(desc(catalogItems.updatedAt)).limit(100);
        if (ctx.user.role !== "admin") {
          const organizationIds = await getUserOrganizationIds(db, ctx.user.id);
          rows.forEach(row => {
            if (!row.organizationId || !organizationIds.includes(row.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Catalog item is outside the active organization scope" });
            try { assertRecordBelongsToScope({ entityType: "catalog_item", jurisdictionId: row.jurisdictionId, organizationId: row.organizationId }, { jurisdictionId: input.jurisdictionId, organizationId: row.organizationId }); } catch (error) { throw new TRPCError({ code: "FORBIDDEN", message: "ERP policy validation rejected the request" }); }
          });
        }
        return rows;
      }),
    createItem: catalogEditorProcedure
      .input(z.object({ jurisdictionId: z.number().int().positive(), organizationId: z.number().int().positive().optional(), category: z.enum(["medicine", "cosmetic", "medical_supply"]), sku: z.string().min(2).max(80), barcode: z.string().max(80).optional(), nameAr: z.string().min(2).max(240), nameEn: z.string().max(240).optional(), genericName: z.string().max(240).optional(), manufacturer: z.string().max(220).optional(), registrationNumber: z.string().max(120).optional(), sourceAuthority: z.string().min(2).max(40), sourceRecordId: z.string().max(160).optional(), sourceUrl: z.string().url().max(500).optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, input.jurisdictionId)).limit(1))[0];
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Jurisdiction not found" });
        try { await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, input.jurisdictionId); } catch (error) { throw new TRPCError({ code: error instanceof TRPCError ? error.code : "FORBIDDEN", message: "ERP policy validation rejected the request" }); }
        try { assertJurisdictionProfileReady({ countryCode: profile.countryCode, active: profile.active === 1, legalAuthorityProfile: profile.legalAuthorityProfile, language: profile.language, defaultLocale: profile.defaultLocale, currencyCode: profile.currencyCode, timezone: profile.timezone, taxProfile: profile.taxProfile, dateFormat: profile.dateFormat, numberSystem: profile.numberSystem }); } catch (error) { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ERP policy validation rejected the request" }); }
        const organizationIds = await getUserOrganizationIds(db, ctx.user.id);
        const organizationId = input.organizationId ?? (organizationIds.length === 1 ? organizationIds[0] : null);
        if (!organizationId || (ctx.user.role !== "admin" && !organizationIds.includes(organizationId))) throw new TRPCError({ code: "FORBIDDEN", message: "Catalog item requires an authorized organization scope" });
        if (input.sourceAuthority !== "LOCAL_PENDING_REVIEW") {
          try {
            assertCatalogIntakeReady({ actorRole: ctx.user.role === "admin" ? "admin" : "catalog_manager", organizationId: String(organizationId), branchId: String(input.jurisdictionId), jurisdictionCode: profile.countryCode, recordOrganizationId: String(organizationId), recordBranchId: String(input.jurisdictionId), recordJurisdictionCode: profile.countryCode, sourceUrl: input.sourceUrl ?? "", sourceVerified: Boolean(input.sourceUrl) });
          } catch (error) {
            throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ERP policy validation rejected the request" });
          }
        }
        const inserted = await db.insert(catalogItems).values({ ...input, organizationId, verificationStatus: input.sourceAuthority === "LOCAL_PENDING_REVIEW" ? "PENDING_REVIEW" : "UNVERIFIED", createdByUserId: ctx.user.id, sourceRetrievedAt: new Date() });
        const itemId = Number(inserted[0].insertId);
        await db.insert(catalogSyncQueue).values({ entityType: input.category, operation: "create", entityId: itemId, idempotencyKey: `catalog-create-${itemId}-${ctx.user.id}`, payloadJson: JSON.stringify(input), createdByUserId: ctx.user.id });
        return { itemId, verificationStatus: input.sourceAuthority === "LOCAL_PENDING_REVIEW" ? "PENDING_REVIEW" as const : "UNVERIFIED" as const };
      }),
    approveItem: catalogEditorProcedure
      .input(z.object({ itemId: z.number().int().positive(), approved: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const item = (await db.select().from(catalogItems).where(eq(catalogItems.id, input.itemId)).limit(1))[0];
        if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Catalog item not found" });
        if (!item.jurisdictionId || !item.organizationId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Catalog item has no complete organization/jurisdiction scope" });
        if (ctx.user.role !== "admin") {
          const organizationIds = await getUserOrganizationIds(db, ctx.user.id);
          if (!organizationIds.includes(item.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Catalog item is outside the active organization scope" });
          try { assertRecordBelongsToScope({ entityType: "catalog_item", jurisdictionId: item.jurisdictionId, organizationId: item.organizationId }, { jurisdictionId: item.jurisdictionId, organizationId: item.organizationId }); } catch (error) { throw new TRPCError({ code: "FORBIDDEN", message: "ERP policy validation rejected the request" }); }
        }
        if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(item.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Catalog item is outside the active organization scope" });
        try { await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, item.jurisdictionId); } catch (error) { throw new TRPCError({ code: error instanceof TRPCError ? error.code : "FORBIDDEN", message: "ERP policy validation rejected the request" }); }
        if (input.approved) {
          if (!item.jurisdictionId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Catalog item has no jurisdiction" });
          const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, item.jurisdictionId)).limit(1))[0];
          if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Jurisdiction not found" });
          try { assertJurisdictionProfileReady({ countryCode: profile.countryCode, active: profile.active === 1, legalAuthorityProfile: profile.legalAuthorityProfile, language: profile.language, defaultLocale: profile.defaultLocale, currencyCode: profile.currencyCode, timezone: profile.timezone, taxProfile: profile.taxProfile, dateFormat: profile.dateFormat, numberSystem: profile.numberSystem }); } catch (error) { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ERP policy validation rejected the request" }); }
          const pack = (await db.select().from(compliancePacks).where(and(eq(compliancePacks.jurisdictionId, item.jurisdictionId), eq(compliancePacks.status, "approved"))).orderBy(desc(compliancePacks.createdAt)).limit(1))[0];
          if (!pack || pack.effectiveFrom > new Date() || (pack.reviewDueAt && pack.reviewDueAt < new Date())) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Approved current compliance pack required" });
          const verified = await db.select().from(complianceEvidence).where(and(eq(complianceEvidence.packId, pack.id), eq(complianceEvidence.verificationStatus, "verified")));
          const parsedRules = JSON.parse(pack.rulesJson) as Record<string, unknown>;
          const packFields = Array.isArray(parsedRules.catalogRequiredFields) ? parsedRules.catalogRequiredFields.filter((field): field is string => typeof field === "string") : [];
          const activeFields = activeCatalogFields(item, item.category);
          try { assertCatalogEvidence(item.category, verified, [...activeFields, ...packFields]); } catch (error) { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ERP policy validation rejected the request" }); }
        }
        await db.update(catalogItems).set({ verificationStatus: input.approved ? "VERIFIED" : "REJECTED", approvedByUserId: ctx.user.id }).where(eq(catalogItems.id, input.itemId));
        return { itemId: input.itemId, status: input.approved ? "VERIFIED" as const : "REJECTED" as const };
      }),
  }),
  ePrescription: router({
    create: clinicianProcedure
      .input(z.object({ branchId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), patientId: z.number().int().positive(), encounterId: z.number().int().positive().optional(), prescriptionCode: z.string().min(6).max(80), expiresAt: z.coerce.date().optional(), lines: z.array(z.object({ catalogItemId: z.number().int().positive().optional(), medicationText: z.string().min(2).max(240), dosage: z.string().min(1).max(160), route: z.string().max(80).optional(), frequency: z.string().min(1).max(120), duration: z.string().min(1).max(120), quantity: z.coerce.number().positive().max(100000), instructions: z.string().max(1000).optional() })).min(1).max(50) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId);
        await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, input.jurisdictionId);
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Prescription is outside the active organization scope" });
        const patient = (await db.select({ id: healthcarePatients.id }).from(healthcarePatients).where(and(eq(healthcarePatients.id, input.patientId), eq(healthcarePatients.organizationId, organizationId), eq(healthcarePatients.jurisdictionId, input.jurisdictionId), eq(healthcarePatients.branchId, input.branchId), eq(healthcarePatients.active, 1))).limit(1))[0];
        if (!patient) throw new TRPCError({ code: "NOT_FOUND", message: "Patient is outside the active branch scope" });
        const assignment = (await db.select().from(branchJurisdictions).where(and(eq(branchJurisdictions.branchId, input.branchId), eq(branchJurisdictions.jurisdictionId, input.jurisdictionId))).limit(1))[0];
        try { assertBranchAssignmentReady(assignment); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Branch jurisdiction assignment is not ready" }); }
        const existing = (await db.select({ id: ePrescriptions.id }).from(ePrescriptions).where(and(eq(ePrescriptions.organizationId, organizationId), eq(ePrescriptions.prescriptionCode, input.prescriptionCode))).limit(1))[0];
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Prescription code already exists in this organization" });
        const head = await db.insert(ePrescriptions).values({ organizationId, jurisdictionId: input.jurisdictionId, branchId: input.branchId, patientId: input.patientId, encounterId: input.encounterId, prescriptionCode: input.prescriptionCode, status: "PENDING_VERIFICATION", prescriberUserId: ctx.user.id, expiresAt: input.expiresAt });
        const prescriptionId = Number(head[0].insertId);
        await db.insert(ePrescriptionLines).values(input.lines.map(line => ({ prescriptionId, catalogItemId: line.catalogItemId, medicationText: line.medicationText, dosage: line.dosage, route: line.route, frequency: line.frequency, duration: line.duration, quantity: String(line.quantity), instructionsEncrypted: line.instructions ?? null })));
        return { prescriptionId, prescriptionCode: input.prescriptionCode, status: "PENDING_VERIFICATION" as const, lineCount: input.lines.length };
      }),
    verify: pharmacistProcedure
      .input(z.object({ prescriptionId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const prescription = (await db.select().from(ePrescriptions).where(eq(ePrescriptions.id, input.prescriptionId)).limit(1))[0];
        if (!prescription) throw new TRPCError({ code: "NOT_FOUND", message: "Prescription not found" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, prescription.branchId);
        await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, prescription.jurisdictionId);
        if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(prescription.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Prescription is outside the active organization scope" });
        if (prescription.status !== "PENDING_VERIFICATION") throw new TRPCError({ code: "CONFLICT", message: "Prescription is not awaiting verification" });
        if (prescription.expiresAt && prescription.expiresAt < new Date()) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Prescription has expired" });
        await db.update(ePrescriptions).set({ status: "VERIFIED", verifierUserId: ctx.user.id, verifiedAt: new Date() }).where(and(eq(ePrescriptions.id, prescription.id), eq(ePrescriptions.organizationId, prescription.organizationId), eq(ePrescriptions.jurisdictionId, prescription.jurisdictionId)));
        return { prescriptionId: prescription.id, status: "VERIFIED" as const };
      }),
    accessByPatientId: pharmacistProcedure
      .input(z.object({ branchId: z.number().int().positive(), jurisdictionId: z.number().int().nonnegative(), patientId: z.number().int().positive(), prescriptionCode: z.string().max(80).optional(), includePending: z.boolean().optional() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId);
        await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, input.jurisdictionId);
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Patient lookup is outside the active organization scope" });
        const patient = (await db.select({ id: healthcarePatients.id }).from(healthcarePatients).where(and(eq(healthcarePatients.id, input.patientId), eq(healthcarePatients.organizationId, organizationId), eq(healthcarePatients.jurisdictionId, input.jurisdictionId), eq(healthcarePatients.branchId, input.branchId), eq(healthcarePatients.active, 1))).limit(1))[0];
        if (!patient) throw new TRPCError({ code: "NOT_FOUND", message: "Patient not found in this branch" });
        const allowedStatuses = input.includePending ? ["PENDING_VERIFICATION", "VERIFIED", "PARTIALLY_DISPENSED"] as const : ["VERIFIED", "PARTIALLY_DISPENSED"] as const;
        const filters = [eq(ePrescriptions.organizationId, organizationId), eq(ePrescriptions.jurisdictionId, input.jurisdictionId), eq(ePrescriptions.branchId, input.branchId), eq(ePrescriptions.patientId, input.patientId), inArray(ePrescriptions.status, allowedStatuses), ...(input.prescriptionCode ? [eq(ePrescriptions.prescriptionCode, input.prescriptionCode)] : [])];
        const prescriptions = await db.select().from(ePrescriptions).where(and(...filters)).orderBy(desc(ePrescriptions.createdAt)).limit(20);
        const result = [];
        for (const prescription of prescriptions) result.push({ prescription, lines: await db.select().from(ePrescriptionLines).where(eq(ePrescriptionLines.prescriptionId, prescription.id)).orderBy(ePrescriptionLines.id) });
        return result;
      }),
    dispenseLine: pharmacistProcedure
      .input(z.object({ prescriptionId: z.number().int().positive(), lineId: z.number().int().positive(), quantity: z.coerce.number().positive() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const prescription = (await db.select().from(ePrescriptions).where(eq(ePrescriptions.id, input.prescriptionId)).limit(1))[0];
        const line = (await db.select().from(ePrescriptionLines).where(and(eq(ePrescriptionLines.id, input.lineId), eq(ePrescriptionLines.prescriptionId, input.prescriptionId))).limit(1))[0];
        if (!prescription || !line) throw new TRPCError({ code: "NOT_FOUND", message: "Prescription line not found" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, prescription.branchId);
        await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, prescription.jurisdictionId);
        if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(prescription.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Dispensing is outside the active organization scope" });
        if (!["VERIFIED", "PARTIALLY_DISPENSED"].includes(prescription.status) || ["CANCELLED", "DISPENSED"].includes(line.status)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Prescription is not eligible for dispensing" });
        const remaining = Number(line.quantity) - Number(line.dispensedQuantity);
        if (input.quantity > remaining) throw new TRPCError({ code: "BAD_REQUEST", message: "Dispensed quantity exceeds the prescribed remainder" });
        const nextDispensed = Number(line.dispensedQuantity) + input.quantity;
        const lineComplete = nextDispensed >= Number(line.quantity);
        await db.update(ePrescriptionLines).set({ dispensedQuantity: String(nextDispensed), status: lineComplete ? "DISPENSED" : "PARTIALLY_DISPENSED" }).where(and(eq(ePrescriptionLines.id, line.id), eq(ePrescriptionLines.prescriptionId, prescription.id)));
        const allLines = await db.select().from(ePrescriptionLines).where(eq(ePrescriptionLines.prescriptionId, prescription.id));
        const allDispensed = allLines.every(item => item.id === line.id ? lineComplete : ["DISPENSED", "CANCELLED"].includes(item.status));
        const anyDispensed = allLines.some(item => item.id === line.id ? nextDispensed > 0 : Number(item.dispensedQuantity) > 0);
        await db.update(ePrescriptions).set({ status: allDispensed ? "DISPENSED" : anyDispensed ? "PARTIALLY_DISPENSED" : prescription.status }).where(eq(ePrescriptions.id, prescription.id));
        return { prescriptionId: prescription.id, lineId: line.id, dispensedQuantity: nextDispensed, lineStatus: lineComplete ? "DISPENSED" as const : "PARTIALLY_DISPENSED" as const, prescriptionStatus: allDispensed ? "DISPENSED" as const : "PARTIALLY_DISPENSED" as const };
      }),
  }),
  cashier: router({
    currentShift: protectedProcedure
      .input(z.object({ branchId: z.number().int().positive(), jurisdictionId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, input.jurisdictionId);
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        return (await db.select().from(cashierShifts).where(and(eq(cashierShifts.organizationId, organizationId), eq(cashierShifts.branchId, input.branchId), eq(cashierShifts.jurisdictionId, input.jurisdictionId), eq(cashierShifts.cashierId, ctx.user.id), eq(cashierShifts.status, "open"))).limit(1))[0] ?? null;
      }),
    openShift: protectedProcedure
      .input(z.object({ branchId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), openingAmount: z.coerce.number().nonnegative() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        if (!["admin", "manager", "cashier"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Cashier shift permission required" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, input.jurisdictionId);
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        const existing = (await db.select({ id: cashierShifts.id }).from(cashierShifts).where(and(eq(cashierShifts.organizationId, organizationId), eq(cashierShifts.branchId, input.branchId), eq(cashierShifts.cashierId, ctx.user.id), eq(cashierShifts.status, "open"))).limit(1))[0];
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "يوجد درج بيع مفتوح لهذا الكاشير" });
        const result = await db.insert(cashierShifts).values({ organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, cashierId: ctx.user.id, openingAmount: input.openingAmount.toFixed(2) });
        return { shiftId: Number(result[0].insertId), status: "open" as const };
      }),
    closeShift: protectedProcedure
      .input(z.object({ shiftId: z.number().int().positive(), countedCash: z.coerce.number().nonnegative(), note: z.string().max(800).optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const shift = (await db.select().from(cashierShifts).where(and(eq(cashierShifts.id, input.shiftId), eq(cashierShifts.cashierId, ctx.user.id), eq(cashierShifts.status, "open"))).limit(1))[0];
        if (!shift) throw new TRPCError({ code: "NOT_FOUND", message: "وردية البيع المفتوحة غير موجودة" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, shift.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, shift.jurisdictionId);
        const cashSales = await db.select({ total: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)` }).from(sales).where(and(eq(sales.organizationId, shift.organizationId), eq(sales.branchId, shift.branchId), eq(sales.cashierId, ctx.user.id), eq(sales.paymentMethod, "cash"), eq(sales.saleStatus, "completed"), gte(sales.createdAt, shift.openedAt)));
        const expected = Number(shift.openingAmount) + Number(cashSales[0]?.total ?? 0); const variance = input.countedCash - expected;
        const closeStatus = Math.abs(variance) < 0.01 ? "approved" : "submitted";
        await db.insert(cashClosures).values({ shiftId: shift.id, organizationId: shift.organizationId, branchId: shift.branchId, jurisdictionId: shift.jurisdictionId, countedCash: input.countedCash.toFixed(2), expectedCash: expected.toFixed(2), varianceCash: variance.toFixed(2), status: closeStatus, submittedByUserId: ctx.user.id, approvedByUserId: closeStatus === "approved" ? ctx.user.id : null, approvedAt: closeStatus === "approved" ? new Date() : null, note: input.note });
        await db.update(cashierShifts).set({ status: closeStatus === "approved" ? "closed" : "pending_review", closedAt: new Date(), closedByUserId: ctx.user.id, closingAmount: input.countedCash.toFixed(2), expectedAmount: expected.toFixed(2), varianceAmount: variance.toFixed(2), closingNote: input.note }).where(eq(cashierShifts.id, shift.id));
        return { shiftId: shift.id, status: closeStatus, expectedCash: expected, varianceCash: variance };
      }),
    approveClosure: protectedProcedure
      .input(z.object({ shiftId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        if (!["admin", "manager"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Manager approval required" });
        const shift = (await db.select().from(cashierShifts).where(and(eq(cashierShifts.id, input.shiftId), eq(cashierShifts.status, "pending_review"))).limit(1))[0]; if (!shift) throw new TRPCError({ code: "NOT_FOUND", message: "تقفيل الوردية غير موجود" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, shift.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, shift.jurisdictionId);
        await db.update(cashClosures).set({ status: "approved", approvedByUserId: ctx.user.id, approvedAt: new Date() }).where(eq(cashClosures.shiftId, shift.id));
        await db.update(cashierShifts).set({ status: "closed" }).where(eq(cashierShifts.id, shift.id)); return { shiftId: shift.id, status: "closed" as const };
      }),
  }),
  salesLedger: router({
    listPeriod: protectedProcedure
      .input(z.object({ branchId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), from: z.coerce.date(), to: z.coerce.date(), cashierId: z.number().int().positive().optional(), status: z.enum(["completed", "voided", "cancelled"]).optional() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, input.jurisdictionId === undefined ? ctx.user.role : ctx.user.role, input.jurisdictionId);
        const organizationId = await getBranchOrganizationId(db, input.branchId);
        return db.select().from(sales).where(and(eq(sales.organizationId, organizationId), eq(sales.branchId, input.branchId), eq(sales.jurisdictionId, input.jurisdictionId), gte(sales.createdAt, input.from), lt(sales.createdAt, input.to), ...(input.cashierId ? [eq(sales.cashierId, input.cashierId)] : []), ...(input.status ? [eq(sales.saleStatus, input.status)] : []))).orderBy(desc(sales.createdAt)).limit(500);
      }),
  }),
  returns: router({
    request: protectedProcedure
      .input(z.object({ saleId: z.number().int().positive(), saleItemId: z.number().int().positive(), quantity: z.coerce.number().positive(), reasonCode: z.string().min(2).max(80), disposition: z.enum(["refund", "exchange", "credit_note", "pending_review"]).default("pending_review"), notes: z.string().max(500).optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const sale = (await db.select().from(sales).where(eq(sales.id, input.saleId)).limit(1))[0]; const item = (await db.select().from(saleItems).where(and(eq(saleItems.id, input.saleItemId), eq(saleItems.saleId, input.saleId))).limit(1))[0];
        if (!sale || !item || sale.saleStatus !== "completed") throw new TRPCError({ code: "NOT_FOUND", message: "الفاتورة أو صنف المرتجع غير صالح" });
        if (input.quantity > Number(item.quantity)) throw new TRPCError({ code: "BAD_REQUEST", message: "كمية المرتجع تتجاوز الكمية المباعة" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, sale.branchId); if (sale.jurisdictionId === null) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Sale jurisdiction scope is missing" }); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, sale.jurisdictionId);
        const amount = Number(item.unitPrice) * input.quantity; const result = await db.insert(salesReturns).values({ organizationId: sale.organizationId, branchId: sale.branchId, jurisdictionId: sale.jurisdictionId, originalSaleId: sale.id, originalSaleItemId: item.id, quantity: input.quantity.toFixed(3), reasonCode: input.reasonCode, disposition: input.disposition, status: "preview", amount: amount.toFixed(2), taxAmount: "0", notes: input.notes, createdByUserId: ctx.user.id });
        return { returnId: Number(result[0].insertId), status: "preview" as const, amount };
      }),
    approve: protectedProcedure
      .input(z.object({ returnId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        if (!["admin", "manager"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Manager approval required" });
        const ret = (await db.select().from(salesReturns).where(and(eq(salesReturns.id, input.returnId), eq(salesReturns.status, "preview"))).limit(1))[0]; if (!ret) throw new TRPCError({ code: "NOT_FOUND", message: "طلب المرتجع غير موجود" });
        await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, ret.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, ret.jurisdictionId);
        if (!ret.originalSaleItemId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "لا يوجد صنف أصلي للمرتجع" });
        const item = (await db.select().from(saleItems).where(eq(saleItems.id, ret.originalSaleItemId)).limit(1))[0]; if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "صنف البيع غير موجود" });
        await db.update(inventoryBatches).set({ quantityOnHand: sql`${inventoryBatches.quantityOnHand} + ${ret.quantity}` }).where(eq(inventoryBatches.id, item.batchId));
        await db.update(salesReturns).set({ status: "completed", approvedByUserId: ctx.user.id, updatedAt: new Date() }).where(eq(salesReturns.id, ret.id)); return { returnId: ret.id, status: "completed" as const };
      }),
  }),
  accounting: router({
    accounts: protectedProcedure.input(z.object({ organizationId: z.number().int().positive().optional(), branchId: z.number().int().positive().optional() }).optional()).query(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); const orgs = await getUserOrganizationIds(db, ctx.user.id); const scope = input?.organizationId ? eq(generalLedgerAccounts.organizationId, input.organizationId) : inArray(generalLedgerAccounts.organizationId, orgs); if (ctx.user.role !== "admin" && input?.organizationId && !orgs.includes(input.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" }); return db.select().from(generalLedgerAccounts).where(and(scope, eq(generalLedgerAccounts.active, 1), ...(input?.branchId ? [or(eq(generalLedgerAccounts.branchId, input.branchId), isNull(generalLedgerAccounts.branchId))] : []) )).orderBy(generalLedgerAccounts.code).limit(1000); }),
    createAccount: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().optional(), parentAccountId: z.number().int().positive().optional(), code: z.string().trim().min(1).max(40), nameAr: z.string().trim().min(2).max(180), nameEn: z.string().trim().max(180).optional(), accountType: z.enum(["asset", "liability", "equity", "revenue", "expense"]), normalBalance: z.enum(["debit", "credit"]), isPostingAllowed: z.boolean().default(true) })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (!["admin", "manager"].includes(ctx.user.role) || !(await getUserOrganizationIds(db, ctx.user.id)).includes(input.organizationId) && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Account management permission required" }); if (input.branchId) await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); let level = 0; if (input.parentAccountId) { const parent = (await db.select().from(generalLedgerAccounts).where(and(eq(generalLedgerAccounts.id, input.parentAccountId), eq(generalLedgerAccounts.organizationId, input.organizationId), eq(generalLedgerAccounts.active, 1))).limit(1))[0]; if (!parent) throw new TRPCError({ code: "NOT_FOUND", message: "الحساب الأب غير موجود" }); level = parent.level + 1; if (parent.isPostingAllowed === 1) await db.update(generalLedgerAccounts).set({ isPostingAllowed: 0 }).where(eq(generalLedgerAccounts.id, parent.id)); } const duplicate = (await db.select({ id: generalLedgerAccounts.id }).from(generalLedgerAccounts).where(and(eq(generalLedgerAccounts.organizationId, input.organizationId), eq(generalLedgerAccounts.code, input.code), input.branchId ? eq(generalLedgerAccounts.branchId, input.branchId) : isNull(generalLedgerAccounts.branchId))).limit(1))[0]; if (duplicate) throw new TRPCError({ code: "CONFLICT", message: "كود الحساب مستخدم بالفعل ضمن النطاق" }); const result = await db.insert(generalLedgerAccounts).values({ organizationId: input.organizationId, branchId: input.branchId, parentAccountId: input.parentAccountId, code: input.code, nameAr: input.nameAr, nameEn: input.nameEn || null, accountType: input.accountType, normalBalance: input.normalBalance, level, isPostingAllowed: input.isPostingAllowed ? 1 : 0 }); await db.insert(auditLogs).values({ userId: ctx.user.id, organizationId: input.organizationId, branchId: input.branchId ?? null, action: "account_created", entityType: "general_ledger_account", entityId: String(result[0].insertId), previousHash: null, recordHash: hashAuditRecord({ eventType: "account_created", organizationId: input.organizationId, branchId: input.branchId, requestId: String(result[0].insertId), createdAt: new Date().toISOString() }) }); return { accountId: Number(result[0].insertId), level }; }),
    costCenters: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().optional() })).query(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(input.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" }); return db.select().from(costCenters).where(and(eq(costCenters.organizationId, input.organizationId), eq(costCenters.active, 1), ...(input.branchId ? [or(eq(costCenters.branchId, input.branchId), isNull(costCenters.branchId))] : []))).orderBy(costCenters.code).limit(500); }),
    periods: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().optional() })).query(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(input.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" }); return db.select().from(accountingFiscalPeriods).where(and(eq(accountingFiscalPeriods.organizationId, input.organizationId), ...(input.branchId ? [or(eq(accountingFiscalPeriods.branchId, input.branchId), isNull(accountingFiscalPeriods.branchId))] : []))).orderBy(desc(accountingFiscalPeriods.startsAt)).limit(100); }),
    postBalancedEntry: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().optional(), sourceType: z.string().min(2).max(60), sourceId: z.string().min(1).max(80), lines: z.array(z.object({ accountId: z.number().int().positive(), debitAmount: z.coerce.number().nonnegative(), creditAmount: z.coerce.number().nonnegative(), costCenterId: z.number().int().positive().optional() })).min(2).max(20) })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (!["admin", "manager"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Accounting posting permission required" }); if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(input.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" }); if (input.branchId) await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); const debit = input.lines.reduce((sum, line) => sum + line.debitAmount, 0); const credit = input.lines.reduce((sum, line) => sum + line.creditAmount, 0); if (debit <= 0 || Math.abs(debit - credit) > 0.005 || input.lines.some(line => line.debitAmount > 0 && line.creditAmount > 0)) throw new TRPCError({ code: "BAD_REQUEST", message: "القيد غير متوازن" }); const accountRows = await db.select().from(generalLedgerAccounts).where(and(eq(generalLedgerAccounts.organizationId, input.organizationId), inArray(generalLedgerAccounts.id, input.lines.map(line => line.accountId)))); if (accountRows.length !== input.lines.length || accountRows.some(account => account.isPostingAllowed !== 1 || account.active !== 1)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "لا يمكن الترحيل إلى حساب تجميعي أو غير نشط" }); const entryGroupId = `${input.sourceType}:${input.sourceId}:${Date.now()}`; await db.insert(generalLedgerEntries).values(input.lines.map(line => ({ organizationId: input.organizationId, branchId: input.branchId, accountId: line.accountId, entryGroupId, debitAmount: line.debitAmount.toFixed(2), creditAmount: line.creditAmount.toFixed(2), sourceType: input.sourceType, sourceId: input.sourceId, createdByUserId: ctx.user.id }))); await db.insert(auditLogs).values({ userId: ctx.user.id, organizationId: input.organizationId, branchId: input.branchId ?? null, action: "ledger_entry_posted", entityType: "general_ledger_entry", entityId: entryGroupId, previousHash: null, recordHash: hashAuditRecord({ eventType: "ledger_entry_posted", organizationId: input.organizationId, branchId: input.branchId, requestId: entryGroupId, createdAt: new Date().toISOString() }) }); return { entryGroupId, status: "posted" as const }; }),
    createExpense: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), expenseAccountId: z.number().int().positive(), paymentAccountId: z.number().int().positive(), costCenterId: z.number().int().positive().optional(), amount: z.coerce.number().positive(), expenseDate: z.coerce.date(), title: z.string().trim().min(2).max(180), justification: z.string().trim().min(10).max(1200), currency: z.string().trim().length(3).default("EGP") })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (!["admin", "manager", "pharmacist"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Expense entry permission required" }); if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(input.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" }); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, input.jurisdictionId); const accounts = await db.select().from(generalLedgerAccounts).where(and(eq(generalLedgerAccounts.organizationId, input.organizationId), inArray(generalLedgerAccounts.id, [input.expenseAccountId, input.paymentAccountId]))); if (accounts.length !== 2 || accounts.some(account => account.isPostingAllowed !== 1 || account.active !== 1)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "حسابات المصروف أو السداد غير صالحة" }); const result = await db.insert(otherExpenses).values({ organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, costCenterId: input.costCenterId, expenseAccountId: input.expenseAccountId, paymentAccountId: input.paymentAccountId, amount: input.amount.toFixed(2), currency: input.currency.toUpperCase(), expenseDate: input.expenseDate, title: input.title, justification: input.justification, createdByUserId: ctx.user.id }); const expenseId = Number(result[0].insertId); await db.insert(auditLogs).values({ userId: ctx.user.id, organizationId: input.organizationId, branchId: input.branchId, action: "other_expense_created", entityType: "other_expense", entityId: String(expenseId), previousHash: null, recordHash: hashAuditRecord({ eventType: "other_expense_created", organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, requestId: String(expenseId), createdAt: new Date().toISOString() }) }); return { expenseId, status: "pending_review" as const }; }),
    expenses: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive(), status: z.enum(["draft", "pending_review", "approved", "rejected", "posted"]).optional() })).query(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(input.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" }); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); return db.select().from(otherExpenses).where(and(eq(otherExpenses.organizationId, input.organizationId), eq(otherExpenses.branchId, input.branchId), ...(input.status ? [eq(otherExpenses.status, input.status)] : []))).orderBy(desc(otherExpenses.createdAt)).limit(200); }),
    reviewExpense: protectedProcedure.input(z.object({ expenseId: z.number().int().positive(), decision: z.enum(["approved", "rejected"]) })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (!["admin", "manager"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Expense review permission required" }); const expense = (await db.select().from(otherExpenses).where(eq(otherExpenses.id, input.expenseId)).limit(1))[0]; if (!expense) throw new TRPCError({ code: "NOT_FOUND", message: "المصروف غير موجود" }); if (expense.createdByUserId === ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "لا يجوز اعتماد العملية لمنشئها" }); if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(expense.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" }); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, expense.branchId); if (expense.status !== "pending_review") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "المصروف تمت مراجعته سابقًا" }); await db.update(otherExpenses).set({ status: input.decision, approvedByUserId: ctx.user.id, approvedAt: new Date() }).where(eq(otherExpenses.id, expense.id)); return { expenseId: expense.id, status: input.decision }; }),
    postExpense: protectedProcedure.input(z.object({ expenseId: z.number().int().positive() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (!["admin", "manager"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Expense posting permission required" }); const expense = (await db.select().from(otherExpenses).where(eq(otherExpenses.id, input.expenseId)).limit(1))[0]; if (!expense || expense.status !== "approved") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "المصروف يجب أن يكون معتمدًا قبل الترحيل" }); if (expense.createdByUserId === ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "يفضل فصل المنشئ عن منفذ الترحيل" }); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, expense.branchId); const existing = expense.journalEntryGroupId ? expense.journalEntryGroupId : null; if (existing) throw new TRPCError({ code: "CONFLICT", message: "المصروف مرحل بالفعل" }); const entryGroupId = `expense:${expense.id}:${Date.now()}`; await db.transaction(async tx => { await tx.insert(generalLedgerEntries).values([{ organizationId: expense.organizationId, branchId: expense.branchId, accountId: expense.expenseAccountId, entryGroupId, debitAmount: expense.amount, creditAmount: "0.00", sourceType: "other_expense", sourceId: String(expense.id), createdByUserId: ctx.user.id }, { organizationId: expense.organizationId, branchId: expense.branchId, accountId: expense.paymentAccountId, entryGroupId, debitAmount: "0.00", creditAmount: expense.amount, sourceType: "other_expense", sourceId: String(expense.id), createdByUserId: ctx.user.id }]); await tx.update(otherExpenses).set({ status: "posted", journalEntryGroupId: entryGroupId }).where(eq(otherExpenses.id, expense.id)); }); return { expenseId: expense.id, entryGroupId, status: "posted" as const }; }),
    interBranchTransfers: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().optional() })).query(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(input.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" }); if (input.branchId) await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); return db.select().from(interBranchTransfers).where(and(eq(interBranchTransfers.organizationId, input.organizationId), ...(input.branchId ? [or(eq(interBranchTransfers.sourceBranchId, input.branchId), eq(interBranchTransfers.destinationBranchId, input.branchId))] : []))).orderBy(desc(interBranchTransfers.createdAt)).limit(100); }),
    createInterBranchTransfer: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), sourceBranchId: z.number().int().positive(), destinationBranchId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), transferType: z.enum(["financial", "inventory", "mixed"]), amount: z.coerce.number().positive().optional(), justification: z.string().trim().min(10).max(1000), lines: z.array(z.object({ productId: z.number().int().positive().optional(), quantity: z.coerce.number().positive().optional(), unitValue: z.coerce.number().positive().optional(), note: z.string().max(500).optional() })).max(200).default([]) })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (input.sourceBranchId === input.destinationBranchId) throw new TRPCError({ code: "BAD_REQUEST", message: "يجب اختلاف الفرع المصدر عن الوجهة" }); if (!["admin", "manager"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Transfer permission required" }); if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(input.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" }); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.sourceBranchId); const destinationOrg = await getBranchOrganizationId(db, input.destinationBranchId); if (destinationOrg !== input.organizationId) throw new TRPCError({ code: "FORBIDDEN", message: "Destination branch scope rejected" }); const result = await db.insert(interBranchTransfers).values({ organizationId: input.organizationId, sourceBranchId: input.sourceBranchId, destinationBranchId: input.destinationBranchId, jurisdictionId: input.jurisdictionId, transferType: input.transferType, amount: input.amount?.toFixed(2) ?? null, justification: input.justification, createdByUserId: ctx.user.id }); const transferId = Number(result[0].insertId); if (input.lines.length) await db.insert(interBranchTransferLines).values(input.lines.map(line => ({ transferId, organizationId: input.organizationId, productId: line.productId, quantity: line.quantity?.toFixed(3), unitValue: line.unitValue?.toFixed(2), note: line.note }))); return { transferId, status: "pending_review" as const }; }),
    reviewInterBranchTransfer: protectedProcedure.input(z.object({ transferId: z.number().int().positive(), decision: z.enum(["approved", "rejected"]), reason: z.string().trim().min(1).max(1000) })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (!["admin", "manager"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Transfer review permission required" }); const transfer = (await db.select().from(interBranchTransfers).where(eq(interBranchTransfers.id, input.transferId)).limit(1))[0]; if (!transfer) throw new TRPCError({ code: "NOT_FOUND", message: "التحويل غير موجود" }); if (transfer.createdByUserId === ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "لا يجوز اعتماد التحويل لمنشئه" }); if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(transfer.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" }); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, transfer.destinationBranchId); await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, transfer.jurisdictionId); if (transfer.status !== "pending_review") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "التحويل تمت مراجعته سابقًا" }); const decidedAt = new Date(); await db.transaction(async tx => { await tx.update(interBranchTransfers).set({ status: input.decision, approvedByUserId: ctx.user.id }).where(eq(interBranchTransfers.id, transfer.id)); const decisionResult = await tx.insert(decisionLogs).values({ organizationId: transfer.organizationId, branchId: transfer.destinationBranchId, jurisdictionId: transfer.jurisdictionId, entityType: "inter_branch_transfer", entityId: transfer.id, decision: input.decision, reason: input.reason, decidedByUserId: ctx.user.id, decidedAt }); const decisionId = Number(decisionResult[0].insertId); await tx.insert(auditLogs).values({ userId: ctx.user.id, organizationId: transfer.organizationId, branchId: transfer.destinationBranchId, action: "inter_branch_transfer_review_recorded", entityType: "decision_log", entityId: String(decisionId), previousHash: null, recordHash: hashAuditRecord({ eventType: "inter_branch_transfer_review_recorded", organizationId: transfer.organizationId, branchId: transfer.destinationBranchId, jurisdictionId: transfer.jurisdictionId, requestId: `${transfer.id}:${decisionId}`, createdAt: decidedAt.toISOString() }) }); }); return { transferId: transfer.id, status: input.decision }; }),
    expenseDocuments: protectedProcedure.input(z.object({ expenseId: z.number().int().positive(), organizationId: z.number().int().positive(), branchId: z.number().int().positive() })).query(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(input.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" }); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); return db.select().from(expenseDocuments).where(and(eq(expenseDocuments.expenseId, input.expenseId), eq(expenseDocuments.organizationId, input.organizationId), eq(expenseDocuments.branchId, input.branchId))).orderBy(desc(expenseDocuments.createdAt)).limit(50); }),
    addExpenseDocument: protectedProcedure.input(z.object({ expenseId: z.number().int().positive(), organizationId: z.number().int().positive(), branchId: z.number().int().positive(), fileKey: z.string().trim().min(5).max(500), fileUrl: z.string().trim().min(5).max(1000), fileName: z.string().trim().min(1).max(255), mimeType: z.string().trim().min(3).max(120), fileSize: z.number().int().positive().max(25 * 1024 * 1024), sha256: z.string().regex(/^[a-f0-9]{64}$/i) })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(input.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" }); await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId); const expense = (await db.select({ id: otherExpenses.id }).from(otherExpenses).where(and(eq(otherExpenses.id, input.expenseId), eq(otherExpenses.organizationId, input.organizationId), eq(otherExpenses.branchId, input.branchId))).limit(1))[0]; if (!expense) throw new TRPCError({ code: "NOT_FOUND", message: "المصروف غير موجود ضمن النطاق" }); const duplicate = (await db.select({ id: expenseDocuments.id }).from(expenseDocuments).where(and(eq(expenseDocuments.organizationId, input.organizationId), eq(expenseDocuments.branchId, input.branchId), eq(expenseDocuments.sha256, input.sha256))).limit(1))[0]; if (duplicate) throw new TRPCError({ code: "CONFLICT", message: "المستند مسجل مسبقًا" }); const result = await db.insert(expenseDocuments).values({ ...input, createdByUserId: ctx.user.id }); return { documentId: Number(result[0].insertId), status: "stored_metadata" as const }; }),
    closePeriod: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().optional(), throughDate: z.coerce.date() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (!["admin", "manager"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Period closing permission required" }); if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(input.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" }); const where = and(eq(generalLedgerEntries.organizationId, input.organizationId), eq(generalLedgerEntries.periodStatus, "open"), lte(generalLedgerEntries.createdAt, input.throughDate), ...(input.branchId ? [eq(generalLedgerEntries.branchId, input.branchId)] : [])); const result = await db.update(generalLedgerEntries).set({ periodStatus: "closed" }).where(where); return { status: "closed" as const, throughDate: input.throughDate.toISOString(), changed: result[0]?.affectedRows ?? 0 }; }),
  }),
  loyalty: router({
    member: protectedProcedure.input(z.object({ customerId: z.number().int().positive() })).query(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); const orgs = await getUserOrganizationIds(db, ctx.user.id); return (await db.select().from(loyaltyMembers).where(and(eq(loyaltyMembers.customerId, input.customerId), ...(ctx.user.role === "admin" ? [] : [inArray(loyaltyMembers.organizationId, orgs)]))).limit(1))[0] ?? null; }),
    plans: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); const orgs = await getUserOrganizationIds(db, ctx.user.id); return db.select().from(membershipPlans).where(and(eq(membershipPlans.active, 1), ...(ctx.user.role === "admin" ? [] : [inArray(membershipPlans.organizationId, orgs)]))).orderBy(membershipPlans.nameAr).limit(200); }),
    memberships: protectedProcedure.input(z.object({ customerId: z.number().int().positive() })).query(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); const orgs = await getUserOrganizationIds(db, ctx.user.id); return db.select().from(customerMemberships).where(and(eq(customerMemberships.customerId, input.customerId), ...(ctx.user.role === "admin" ? [] : [inArray(customerMemberships.organizationId, orgs)]))).orderBy(desc(customerMemberships.endsAt)).limit(50); }),
    ensureMember: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), customerId: z.number().int().positive() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(input.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" }); const existing = (await db.select().from(loyaltyMembers).where(and(eq(loyaltyMembers.organizationId, input.organizationId), eq(loyaltyMembers.customerId, input.customerId))).limit(1))[0]; if (existing) return existing; const result = await db.insert(loyaltyMembers).values({ organizationId: input.organizationId, customerId: input.customerId, pointsBalance: "0", status: "active" }); return (await db.select().from(loyaltyMembers).where(eq(loyaltyMembers.id, result[0].insertId)).limit(1))[0]; }),
    recordPoints: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive(), customerId: z.number().int().positive(), pointsDelta: z.coerce.number().refine(value => value !== 0, "pointsDelta cannot be zero"), reasonCode: z.string().min(2).max(80), saleId: z.number().int().positive().optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(input.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" }); const member = (await db.select().from(loyaltyMembers).where(and(eq(loyaltyMembers.organizationId, input.organizationId), eq(loyaltyMembers.customerId, input.customerId))).limit(1))[0]; if (!member || member.status !== "active") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "لا يوجد ملف ولاء نشط" }); const nextBalance = Number(member.pointsBalance) + input.pointsDelta; if (nextBalance < 0) throw new TRPCError({ code: "BAD_REQUEST", message: "رصيد النقاط لا يكفي" }); const result = await db.transaction(async tx => { const txResult = await tx.insert(loyaltyTransactions).values({ organizationId: input.organizationId, branchId: input.branchId, memberId: member.id, saleId: input.saleId, pointsDelta: input.pointsDelta.toFixed(2), reasonCode: input.reasonCode, createdByUserId: ctx.user.id }); await tx.update(loyaltyMembers).set({ pointsBalance: nextBalance.toFixed(2) }).where(eq(loyaltyMembers.id, member.id)); return txResult; }); return { transactionId: result[0].insertId, pointsBalance: nextBalance }; }),
    createMembership: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), customerId: z.number().int().positive(), planId: z.number().int().positive(), startsAt: z.coerce.date().optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (!["admin", "manager"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Membership management permission required" }); if (ctx.user.role !== "admin" && !(await getUserOrganizationIds(db, ctx.user.id)).includes(input.organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" }); const plan = (await db.select().from(membershipPlans).where(and(eq(membershipPlans.id, input.planId), eq(membershipPlans.organizationId, input.organizationId), eq(membershipPlans.active, 1))).limit(1))[0]; if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "خطة العضوية غير موجودة" }); const startsAt = input.startsAt ?? new Date(); const endsAt = new Date(startsAt.getTime() + plan.durationDays * 86400000); const result = await db.insert(customerMemberships).values({ organizationId: input.organizationId, customerId: input.customerId, planId: input.planId, status: "active", startsAt, endsAt, createdByUserId: ctx.user.id }); return { membershipId: result[0].insertId, startsAt, endsAt, status: "active" as const }; }),
  }),
});
