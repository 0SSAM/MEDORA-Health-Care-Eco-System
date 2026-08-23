import { and, desc, eq, isNull } from "drizzle-orm";
import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, authenticationEvents, internalCredentials, internalSessions, passwordResetTokens, users, ndaAcceptances, organizationMemberships, branchUsers, branches, branchJurisdictions, organizations, jurisdictionProfiles, products, inventoryBatches, catalogItems, compliancePacks, complianceEvidence, healthcarePatients, ePrescriptions, ePrescriptionLines } from "../drizzle/schema";
import { isCurrentNdaAcceptance } from "./domain/nda-policy";
import { hashAuditRecord, hashInternalPassword, hashSessionToken, isSessionEnvironmentConsistent, verifyInternalPassword } from "./domain/internal-auth";
import { ENV } from './_core/env';
import { safeErrorLabel } from './domain/safe-error';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", safeErrorLabel(error));
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", safeErrorLabel(error));
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0];
}

export async function getCurrentNdaAcceptance(userId: number, documentVersion: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(ndaAcceptances).where(eq(ndaAcceptances.userId, userId));
  return rows.find(row => row.documentVersion === documentVersion);
}

export async function hasCurrentNdaAcceptance(userId: number, documentVersion: string, documentHash?: string) {
  const acceptance = await getCurrentNdaAcceptance(userId, documentVersion);
  if (!documentHash) return Boolean(acceptance);
  return isCurrentNdaAcceptance(acceptance);
}

export async function recordNdaAcceptance(input: {
  userId: number;
  documentVersion: string;
  documentHash: string;
  locale: "ar" | "en";
  declaredSurface: "web" | "mobile_webview" | "desktop_wrapper" | "unknown";
}) {
  const db = await getDb();
  if (!db) throw new Error("NDA acceptance cannot be recorded while the database is unavailable");
  const acceptedAt = new Date();
  await db.insert(ndaAcceptances).values({
    ...input,
    acceptanceMethod: "explicit_checkbox",
    acceptedAt,
  }).onDuplicateKeyUpdate({
    set: {
      documentHash: input.documentHash,
      locale: input.locale,
      declaredSurface: input.declaredSurface,
      acceptanceMethod: "explicit_checkbox",
      acceptedAt,
    },
  });
  return getCurrentNdaAcceptance(input.userId, input.documentVersion);
}

export async function getInternalCredentialByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(internalCredentials).where(eq(internalCredentials.username, username)).limit(1);
  return result[0];
}

const SHOWCASE_IDENTITIES = [
  {
    username: "test",
    openId: "medora-showcase-manager-v1",
    name: "MEDORA Showcase Manager",
    role: "manager" as const,
    organizationRole: "org_admin" as const,
  },
  {
    username: "pharmacist.demo",
    openId: "medora-showcase-pharmacist-v1",
    name: "MEDORA Showcase Pharmacist",
    role: "pharmacist" as const,
    organizationRole: "clinical_lead" as const,
  },
  {
    username: "cashier.demo",
    openId: "medora-showcase-cashier-v1",
    name: "MEDORA Showcase Cashier",
    role: "cashier" as const,
    organizationRole: "staff" as const,
  },
] as const;
const SHOWCASE_ORGANIZATION_NAME = "MEDORA Investor Showcase";
const SHOWCASE_TAX_PROFILE = "SHOWCASE_NOT_REGULATORY";
const SHOWCASE_COMPLIANCE_PACK_VERSION = "MEDORA-SHOWCASE-DEMO-V1";
const SHOWCASE_COMPLIANCE_SOURCE_URL = "https://medora.invalid/showcase-policy";
// Keep the branch code stable across the brand migration so existing Demo data is reused.
const SHOWCASE_BRANCH_CODE = "ALDORA-SHOWCASE-001";
const SHOWCASE_DEMO_FIXTURES = [
  { sku: "DEMO-PARACETAMOL-500", barcode: "DEMO890000000001", nameAr: "باراسيتامول 500 مجم (بيانات تجريبية)", nameEn: "Paracetamol 500mg (Demo)", price: "35.00", quantity: "120", reorderPoint: "20", batch: "DEMO-BATCH-001" },
  { sku: "DEMO-VITAMIN-C", barcode: "DEMO890000000002", nameAr: "فيتامين ج (بيانات تجريبية)", nameEn: "Vitamin C (Demo)", price: "75.00", quantity: "8", reorderPoint: "15", batch: "DEMO-BATCH-002" },
  { sku: "DEMO-THERMOMETER", barcode: "DEMO890000000003", nameAr: "ترمومتر رقمي (بيانات تجريبية)", nameEn: "Digital Thermometer (Demo)", price: "180.00", quantity: "0", reorderPoint: "5", batch: "DEMO-BATCH-003" },
  { sku: "DEMO-SALINE", barcode: "DEMO890000000004", nameAr: "محلول ملحي (بيانات تجريبية)", nameEn: "Saline Solution (Demo)", price: "25.00", quantity: "42", reorderPoint: "10", batch: "DEMO-BATCH-004" },
] as const;

/** Seeds only clearly labelled synthetic inventory for the isolated showcase organization. */
export async function seedShowcaseDemoData(input: { organizationId: number; branchId: number; jurisdictionId: number; createdByUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Demo data requires a database");
  const organization = (await db.select({ environment: organizations.environment }).from(organizations).where(eq(organizations.id, input.organizationId)).limit(1))[0];
  if (!organization || organization.environment !== "showcase") throw new Error("Demo data is restricted to showcase organizations");
  return db.transaction(async tx => {
    let productsCreated = 0;
    let batchesCreated = 0;
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const policyNow = new Date();
    const policyReviewDueAt = new Date(policyNow.getTime() + 365 * 24 * 60 * 60 * 1000);
    await tx.insert(compliancePacks).values({
      jurisdictionId: input.jurisdictionId,
      packVersion: SHOWCASE_COMPLIANCE_PACK_VERSION,
      authorityName: "MEDORA Showcase — Synthetic non-regulatory policy",
      sourceUrl: SHOWCASE_COMPLIANCE_SOURCE_URL,
      effectiveFrom: policyNow,
      reviewDueAt: policyReviewDueAt,
      status: "approved",
      rulesJson: JSON.stringify({ catalog: true, sale: true, invoice: true }),
      createdByUserId: input.createdByUserId,
      approvedByUserId: input.createdByUserId,
    }).onDuplicateKeyUpdate({ set: {
      authorityName: "MEDORA Showcase — Synthetic non-regulatory policy",
      sourceUrl: SHOWCASE_COMPLIANCE_SOURCE_URL,
      effectiveFrom: policyNow,
      reviewDueAt: policyReviewDueAt,
      status: "approved",
      rulesJson: JSON.stringify({ catalog: true, sale: true, invoice: true }),
      approvedByUserId: input.createdByUserId,
    } });
    const showcasePack = (await tx.select().from(compliancePacks).where(and(
      eq(compliancePacks.jurisdictionId, input.jurisdictionId),
      eq(compliancePacks.packVersion, SHOWCASE_COMPLIANCE_PACK_VERSION),
    )).limit(1))[0];
    if (!showcasePack) throw new Error("Showcase compliance bootstrap failed");
    for (const operation of ["catalog", "sale"] as const) {
      const evidence = (await tx.select().from(complianceEvidence).where(and(
        eq(complianceEvidence.jurisdictionId, input.jurisdictionId),
        eq(complianceEvidence.packId, showcasePack.id),
        eq(complianceEvidence.operation, operation),
      )).limit(1))[0];
      const evidenceValues = {
        jurisdictionId: input.jurisdictionId,
        packId: showcasePack.id,
        operation,
        authorityName: "MEDORA Showcase — Synthetic non-regulatory policy",
        sourceUrl: SHOWCASE_COMPLIANCE_SOURCE_URL,
        sourceRecordId: `showcase-${operation}-evidence-v1`,
        sourceRetrievedAt: policyNow,
        effectiveFrom: policyNow,
        reviewDueAt: policyReviewDueAt,
        verificationStatus: "verified" as const,
        verifiedByUserId: input.createdByUserId,
        verifiedAt: policyNow,
        notes: "Synthetic showcase-only evidence. It is never an authority, production, or government record.",
      };
      if (evidence) await tx.update(complianceEvidence).set(evidenceValues).where(eq(complianceEvidence.id, evidence.id));
      else await tx.insert(complianceEvidence).values(evidenceValues);
    }
    const showcaseCatalogEvidenceFields = ["nameAr", "category", "sku", "barcode", "nameEn", "sourceAuthority", "sourceRecordId", "registrationNumber"] as const;
    for (const catalogField of showcaseCatalogEvidenceFields) {
      const fieldEvidence = (await tx.select().from(complianceEvidence).where(and(
        eq(complianceEvidence.jurisdictionId, input.jurisdictionId),
        eq(complianceEvidence.packId, showcasePack.id),
        eq(complianceEvidence.operation, "catalog"),
        eq(complianceEvidence.catalogField, catalogField),
      )).limit(1))[0];
      const fieldEvidenceValues = {
        jurisdictionId: input.jurisdictionId,
        packId: showcasePack.id,
        operation: "catalog",
        catalogField,
        authorityName: "MEDORA Showcase — Synthetic non-regulatory policy",
        sourceUrl: SHOWCASE_COMPLIANCE_SOURCE_URL,
        sourceRecordId: `showcase-catalog-${catalogField}-evidence-v1`,
        sourceRetrievedAt: policyNow,
        effectiveFrom: policyNow,
        reviewDueAt: policyReviewDueAt,
        verificationStatus: "verified" as const,
        verifiedByUserId: input.createdByUserId,
        verifiedAt: policyNow,
        notes: "Synthetic showcase-only field evidence. It is never an authority, production, or government record.",
      };
      if (fieldEvidence) await tx.update(complianceEvidence).set(fieldEvidenceValues).where(eq(complianceEvidence.id, fieldEvidence.id));
      else await tx.insert(complianceEvidence).values(fieldEvidenceValues);
    }
    for (const fixture of SHOWCASE_DEMO_FIXTURES) {
      let product = (await tx.select().from(products).where(eq(products.sku, fixture.sku)).limit(1))[0];
      if (product && product.organizationId !== input.organizationId) throw new Error("Reserved Demo SKU belongs to another organization");
      if (!product) {
        await tx.insert(products).values({ organizationId: input.organizationId, jurisdictionId: input.jurisdictionId, sku: fixture.sku, barcode: fixture.barcode, nameAr: fixture.nameAr, nameEn: fixture.nameEn, officialPrice: fixture.price, requiresPrescription: 0, active: 1 });
        product = (await tx.select().from(products).where(eq(products.sku, fixture.sku)).limit(1))[0];
        productsCreated += 1;
      }
      if (!product) throw new Error("Demo product bootstrap failed");
      let catalog = (await tx.select().from(catalogItems).where(and(eq(catalogItems.sku, fixture.sku), eq(catalogItems.organizationId, input.organizationId), eq(catalogItems.jurisdictionId, input.jurisdictionId))).limit(1))[0];
      if (catalog && catalog.organizationId !== input.organizationId) throw new Error("Reserved Demo catalog SKU belongs to another organization");
      if (!catalog) {
        const createdCatalog = await tx.insert(catalogItems).values({ jurisdictionId: input.jurisdictionId, organizationId: input.organizationId, category: fixture.sku.includes("THERMOMETER") || fixture.sku.includes("SALINE") ? "medical_supply" : "medicine", sku: fixture.sku, barcode: fixture.barcode, priceEgp: fixture.price, nameAr: fixture.nameAr, nameEn: fixture.nameEn, sourceAuthority: "DEMO_FIXTURE", sourceRecordId: fixture.sku, sourceNotes: "Synthetic showcase-only fixture; not an authority or production catalog record.", verificationStatus: "VERIFIED", createdByUserId: input.createdByUserId, approvedByUserId: input.createdByUserId });
        const catalogId = Number(createdCatalog[0].insertId);
        catalog = (await tx.select().from(catalogItems).where(eq(catalogItems.id, catalogId)).limit(1))[0];
      }
      if (!catalog) throw new Error("Demo catalog bootstrap failed");
      if (catalog.verificationStatus !== "VERIFIED") await tx.update(catalogItems).set({ verificationStatus: "VERIFIED", approvedByUserId: input.createdByUserId }).where(eq(catalogItems.id, catalog.id));
      if (product.catalogItemId !== catalog.id) await tx.update(products).set({ catalogItemId: catalog.id }).where(and(eq(products.id, product.id), eq(products.organizationId, input.organizationId)));
      const existingBatch = (await tx.select().from(inventoryBatches).where(and(eq(inventoryBatches.organizationId, input.organizationId), eq(inventoryBatches.branchId, input.branchId), eq(inventoryBatches.productId, product.id), eq(inventoryBatches.batchNumber, fixture.batch))).limit(1))[0];
      if (!existingBatch) {
        await tx.insert(inventoryBatches).values({ organizationId: input.organizationId, jurisdictionId: input.jurisdictionId, branchId: input.branchId, productId: product.id, batchNumber: fixture.batch, expiryDate, quantityOnHand: fixture.quantity, reorderPoint: fixture.reorderPoint });
        batchesCreated += 1;
      }
    }
    return { productsCreated, batchesCreated, fixtureCount: SHOWCASE_DEMO_FIXTURES.length };
  });
}

/**
 * Ensures a deliberately isolated, non-production showcase identity exists.
 * This path is idempotent, accepts only the fixed allowlisted showcase usernames,
 * and derives the password hash from server-side secret management only.
 */
export async function ensureShowcaseAccount(username: string) {
  const identity = SHOWCASE_IDENTITIES.find(item => item.username === username);
  if (!identity) return false;
  const configuredPassword = process.env.SHOWCASE_TEST_PASSWORD?.replace(/\r?\n/g, "");
  if (!configuredPassword) return false;

  const db = await getDb();
  if (!db) throw new Error("Showcase authentication requires a database");

  return db.transaction(async tx => {
    const credentialRows = await tx.select().from(internalCredentials).where(eq(internalCredentials.username, identity.username)).limit(1);
    const existingCredential = credentialRows[0];
    if (existingCredential && existingCredential.accountType !== "showcase") {
      throw new Error("Reserved showcase username is not a showcase account");
    }

    let showcaseUserId = existingCredential?.userId;
    if (!showcaseUserId) {
      const existingUser = (await tx.select().from(users).where(eq(users.openId, identity.openId)).limit(1))[0];
      if (existingUser) {
        showcaseUserId = existingUser.id;
      } else {
        await tx.insert(users).values({
          openId: identity.openId,
          name: identity.name,
          loginMethod: "internal_showcase",
          role: identity.role,
          lastSignedIn: new Date(),
        });
        showcaseUserId = (await tx.select().from(users).where(eq(users.openId, identity.openId)).limit(1))[0]?.id;
      }
    }
    if (!showcaseUserId) throw new Error("Showcase user bootstrap failed");
    // Repair persisted labels and roles on every Demo login so legacy sessions cannot
    // reintroduce the retired brand or a role outside the closed showcase allowlist.
    await tx.update(users).set({ openId: identity.openId, name: identity.name, role: identity.role, loginMethod: "internal_showcase" }).where(eq(users.id, showcaseUserId));

    let showcaseOrganization = (await tx.select().from(organizations).where(and(
      eq(organizations.environment, "showcase"),
      eq(organizations.displayName, SHOWCASE_ORGANIZATION_NAME),
    )).limit(1))[0];
    // Reuse and relabel the legacy showcase organization instead of creating a duplicate.
    if (!showcaseOrganization) {
      const legacyShowcase = (await tx.select().from(organizations).where(and(
        eq(organizations.displayName, "ALDORA Investor Showcase"),
        eq(organizations.environment, "showcase"),
      )).limit(1))[0];
      if (legacyShowcase) {
        await tx.update(organizations).set({
          displayName: SHOWCASE_ORGANIZATION_NAME,
          legalName: "MEDORA Investor Showcase — Non-production",
        }).where(eq(organizations.id, legacyShowcase.id));
        showcaseOrganization = { ...legacyShowcase, displayName: SHOWCASE_ORGANIZATION_NAME, legalName: "MEDORA Investor Showcase — Non-production" };
      }
    }
    if (!showcaseOrganization) {
      await tx.insert(organizations).values({
        organizationType: "pharmacy",
        legalName: "MEDORA Investor Showcase — Non-production",
        displayName: SHOWCASE_ORGANIZATION_NAME,
        countryCode: "EG",
        status: "active",
        environment: "showcase",
      });
      showcaseOrganization = (await tx.select().from(organizations).where(and(
        eq(organizations.displayName, SHOWCASE_ORGANIZATION_NAME),
        eq(organizations.environment, "showcase"),
      )).limit(1))[0];
    }
    if (!showcaseOrganization) throw new Error("Showcase organization bootstrap failed");
    if (showcaseOrganization.displayName === "ALDORA Investor Showcase") {
      await tx.update(organizations).set({ displayName: SHOWCASE_ORGANIZATION_NAME, legalName: "MEDORA Investor Showcase — Non-production" }).where(eq(organizations.id, showcaseOrganization.id));
      showcaseOrganization = { ...showcaseOrganization, displayName: SHOWCASE_ORGANIZATION_NAME, legalName: "MEDORA Investor Showcase — Non-production" };
    }

    let showcaseBranch = (await tx.select().from(branches).where(eq(branches.code, SHOWCASE_BRANCH_CODE)).limit(1))[0];
    if (showcaseBranch && showcaseBranch.organizationId !== showcaseOrganization.id) {
      throw new Error("Reserved showcase branch code has an unexpected organization");
    }
    if (!showcaseBranch) {
      await tx.insert(branches).values({
        organizationId: showcaseOrganization.id,
        code: SHOWCASE_BRANCH_CODE,
        nameAr: "فرع العرض التجريبي المعزول",
        address: "Showcase only — no physical or regulated operations",
        active: 1,
      });
      showcaseBranch = (await tx.select().from(branches).where(eq(branches.code, SHOWCASE_BRANCH_CODE)).limit(1))[0];
    }
    if (!showcaseBranch) throw new Error("Showcase branch bootstrap failed");

    let showcaseJurisdiction = (await tx.select().from(jurisdictionProfiles).where(and(eq(jurisdictionProfiles.countryCode, "EG"), eq(jurisdictionProfiles.taxProfile, SHOWCASE_TAX_PROFILE))).limit(1))[0];
    if (!showcaseJurisdiction) {
      await tx.insert(jurisdictionProfiles).values({
        countryCode: "EG",
        countryNameAr: "نطاق عرض غير تنظيمي",
        legalAuthorityProfile: "UNVERIFIED_AUTHORITY",
        language: "ar",
        defaultLocale: "ar-EG",
        currencyCode: "EGP",
        timezone: "Africa/Cairo",
        taxProfile: SHOWCASE_TAX_PROFILE,
        dateFormat: "dd/MM/yyyy",
        numberSystem: "latn",
        active: 0,
      });
      showcaseJurisdiction = (await tx.select().from(jurisdictionProfiles).where(and(eq(jurisdictionProfiles.countryCode, "EG"), eq(jurisdictionProfiles.taxProfile, SHOWCASE_TAX_PROFILE))).limit(1))[0];
    }
    if (!showcaseJurisdiction) throw new Error("Showcase jurisdiction bootstrap failed");

    await tx.insert(organizationMemberships).values({
      organizationId: showcaseOrganization.id,
      userId: showcaseUserId,
      organizationRole: identity.organizationRole,
      active: 1,
    }).onDuplicateKeyUpdate({ set: { organizationRole: identity.organizationRole, active: 1 } });
    await tx.insert(branchUsers).values({ branchId: showcaseBranch.id, userId: showcaseUserId, active: 1 })
      .onDuplicateKeyUpdate({ set: { active: 1 } });
    await tx.insert(branchJurisdictions).values({
      branchId: showcaseBranch.id,
      jurisdictionId: showcaseJurisdiction.id,
      locationSource: "manual_override",
      confirmedByUserId: showcaseUserId,
    }).onDuplicateKeyUpdate({ set: { jurisdictionId: showcaseJurisdiction.id, locationSource: "manual_override", confirmedByUserId: showcaseUserId, confirmedAt: new Date() } });

    if (!existingCredential) {
      await tx.insert(internalCredentials).values({
        userId: showcaseUserId,
        username: identity.username,
        passwordHash: hashInternalPassword(configuredPassword),
        failedAttempts: 0,
        lockedUntil: null,
        active: 1,
        accountType: "showcase",
        passwordChangedAt: new Date(),
      });
    } else if (!verifyInternalPassword(configuredPassword, existingCredential.passwordHash)) {
      const now = new Date();
      await tx.update(internalCredentials).set({
        passwordHash: hashInternalPassword(configuredPassword),
        failedAttempts: 0,
        lockedUntil: null,
        passwordChangedAt: now,
      }).where(eq(internalCredentials.id, existingCredential.id));
      await tx.update(internalSessions).set({ revokedAt: now }).where(and(
        eq(internalSessions.userId, showcaseUserId),
        isNull(internalSessions.revokedAt),
      ));
    }
    return true;
  });
}

export async function createPasswordResetToken(input: { userId: number; credentialId: number; token: string; expiresAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Password recovery requires a database");
  await db.insert(passwordResetTokens).values({ userId: input.userId, credentialId: input.credentialId, tokenHash: hashSessionToken(input.token), expiresAt: input.expiresAt });
}

export async function resetInternalPasswordWithToken(input: { token: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) throw new Error("Password reset requires a database");
  const now = new Date();
  const tokenHash = hashSessionToken(input.token);
  return db.transaction(async tx => {
    const matches = await tx.select({ reset: passwordResetTokens, credential: internalCredentials }).from(passwordResetTokens)
      .innerJoin(internalCredentials, eq(internalCredentials.id, passwordResetTokens.credentialId))
      .where(and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt)))
      .limit(1);
    const match = matches[0];
    if (!match || match.reset.expiresAt.getTime() <= now.getTime() || !match.credential.active) return false;
    const consumed = await tx.update(passwordResetTokens).set({ usedAt: now }).where(and(eq(passwordResetTokens.id, match.reset.id), isNull(passwordResetTokens.usedAt)));
    if ((consumed as { affectedRows?: number }).affectedRows !== 1) return false;
    await tx.update(internalCredentials).set({ passwordHash: input.passwordHash, failedAttempts: 0, lockedUntil: null, passwordChangedAt: now }).where(eq(internalCredentials.id, match.credential.id));
    await tx.update(internalSessions).set({ revokedAt: now }).where(and(eq(internalSessions.userId, match.reset.userId), isNull(internalSessions.revokedAt)));
    return { userId: match.reset.userId } as const;
  });
}

export async function getInternalScopeForUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({
    organizationId: organizationMemberships.organizationId,
    branchId: branches.id,
    jurisdictionId: branchJurisdictions.jurisdictionId,
    role: organizationMemberships.organizationRole,
  }).from(organizationMemberships)
    .innerJoin(branchUsers, eq(branchUsers.userId, organizationMemberships.userId))
    .innerJoin(branches, eq(branches.id, branchUsers.branchId))
    .innerJoin(branchJurisdictions, eq(branchJurisdictions.branchId, branches.id))
    .where(and(eq(organizationMemberships.userId, userId), eq(organizationMemberships.active, 1), eq(branchUsers.active, 1), eq(branches.active, 1)))
    .limit(1);
  return result[0];
}

export async function getInternalSessionModeAvailability(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const current = await getInternalSession(token);
  if (!current) return undefined;
  const scopes = await db.select({ environment: organizations.environment }).from(organizationMemberships)
    .innerJoin(branchUsers, eq(branchUsers.userId, organizationMemberships.userId))
    .innerJoin(branches, eq(branches.id, branchUsers.branchId))
    .innerJoin(branchJurisdictions, eq(branchJurisdictions.branchId, branches.id))
    .innerJoin(jurisdictionProfiles, eq(jurisdictionProfiles.id, branchJurisdictions.jurisdictionId))
    .innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
    .where(and(eq(organizationMemberships.userId, current.session.userId), eq(organizationMemberships.active, 1), eq(branchUsers.active, 1), eq(branches.active, 1), eq(organizations.status, "active")));
  const available = new Set(scopes.map(scope => scope.environment));
  return { currentMode: current.session.sessionMode, showcase: available.has("showcase"), production: available.has("production") } as const;
}

export async function switchInternalSessionMode(token: string, targetMode: "production" | "showcase") {
  const db = await getDb();
  if (!db) return undefined;
  const current = await getInternalSession(token);
  if (!current) return undefined;
  const target = await db.select({ organizationId: organizationMemberships.organizationId, branchId: branches.id, jurisdictionId: branchJurisdictions.jurisdictionId, role: organizationMemberships.organizationRole }).from(organizationMemberships)
    .innerJoin(branchUsers, eq(branchUsers.userId, organizationMemberships.userId))
    .innerJoin(branches, eq(branches.id, branchUsers.branchId))
    .innerJoin(branchJurisdictions, eq(branchJurisdictions.branchId, branches.id))
    .innerJoin(jurisdictionProfiles, eq(jurisdictionProfiles.id, branchJurisdictions.jurisdictionId))
    .innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
    .where(and(eq(organizationMemberships.userId, current.session.userId), eq(organizationMemberships.active, 1), eq(branchUsers.active, 1), eq(branches.active, 1), eq(organizations.status, "active"), eq(organizations.environment, targetMode), targetMode === "production" ? eq(jurisdictionProfiles.active, 1) : eq(jurisdictionProfiles.taxProfile, "SHOWCASE_NOT_REGULATORY")))
    .limit(1);
  const scope = target[0];
  if (!scope) return { success: false as const, reason: "unavailable" as const };
  await db.update(internalSessions).set({ organizationId: scope.organizationId, branchId: scope.branchId, jurisdictionId: scope.jurisdictionId, role: scope.role, sessionMode: targetMode }).where(eq(internalSessions.sessionHash, hashSessionToken(token)));
  return { success: true as const, scope, sessionMode: targetMode };
}

export async function createInternalSession(input: { token: string; userId: number; organizationId: number; branchId: number; jurisdictionId: number; role: string; expiresAt: Date; sessionMode?: "production" | "showcase" }) {
  const db = await getDb();
  if (!db) throw new Error("Internal authentication requires a database");
  await db.insert(internalSessions).values({ sessionHash: hashSessionToken(input.token), userId: input.userId, organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, role: input.role, expiresAt: input.expiresAt, sessionMode: input.sessionMode ?? "production" });
}

export async function getInternalSession(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({ session: internalSessions, user: users, organizationEnvironment: organizations.environment }).from(internalSessions)
    .innerJoin(users, eq(users.id, internalSessions.userId))
    .innerJoin(internalCredentials, and(eq(internalCredentials.userId, internalSessions.userId), eq(internalCredentials.active, 1)))
    .innerJoin(organizations, and(eq(organizations.id, internalSessions.organizationId), eq(organizations.status, "active")))
    .innerJoin(organizationMemberships, and(
      eq(organizationMemberships.userId, internalSessions.userId),
      eq(organizationMemberships.organizationId, internalSessions.organizationId),
      eq(organizationMemberships.active, 1),
    ))
    .innerJoin(branches, and(
      eq(branches.id, internalSessions.branchId),
      eq(branches.organizationId, internalSessions.organizationId),
      eq(branches.active, 1),
    ))
    .innerJoin(branchUsers, and(
      eq(branchUsers.userId, internalSessions.userId),
      eq(branchUsers.branchId, internalSessions.branchId),
      eq(branchUsers.active, 1),
    ))
    .innerJoin(branchJurisdictions, and(
      eq(branchJurisdictions.branchId, internalSessions.branchId),
      eq(branchJurisdictions.jurisdictionId, internalSessions.jurisdictionId),
    ))
    .where(and(
      eq(internalSessions.sessionHash, hashSessionToken(token)),
      isNull(internalSessions.revokedAt),
    ))
    .limit(1);
  const row = result[0];
  if (!row || row.session.expiresAt.getTime() <= Date.now()) return undefined;
  if (!isSessionEnvironmentConsistent(row.session.sessionMode, row.organizationEnvironment)) return undefined;
  return row;
}

export async function revokeInternalSession(token: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(internalSessions).set({ revokedAt: new Date() }).where(and(eq(internalSessions.sessionHash, hashSessionToken(token)), isNull(internalSessions.revokedAt)));
}

type AuthenticationEventInput = { userId?: number | null; username?: string | null; organizationId?: number | null; branchId?: number | null; jurisdictionId?: number | null; eventType: "login_success" | "login_failure" | "logout" | "lockout" | "session_revoked" | "password_reset_requested" | "password_reset_completed" | "cache_refreshed" | "showcase_mutation_simulated"; source: "internal" | "oauth"; requestId?: string | null };

let auditWriteQueue: Promise<void> = Promise.resolve();

export function recordAuthenticationEvent(input: AuthenticationEventInput) {
  const safeInput = {
    ...input,
    username: input.username?.trim().slice(0, 80) ?? null,
    requestId: input.requestId?.trim().slice(0, 120) ?? null,
  };
  const write = auditWriteQueue.then(async () => {
    const db = await getDb();
    if (!db) return;
    const previous = await db.select({ recordHash: authenticationEvents.recordHash }).from(authenticationEvents).orderBy(desc(authenticationEvents.id)).limit(1);
    const createdAt = new Date();
    const previousHash = previous[0]?.recordHash ?? null;
    const recordHash = hashAuditRecord({ ...safeInput, previousHash, createdAt: createdAt.toISOString() });
    await db.insert(authenticationEvents).values({ ...safeInput, previousHash, recordHash, createdAt });
  });
  auditWriteQueue = write.catch(() => undefined);
  return write;
}

// TODO: add feature queries here as your schema grows.
