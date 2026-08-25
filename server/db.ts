import { and, desc, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../drizzle/schema";
import { InsertUser, authenticationEvents, internalCredentials, internalSessions, passwordResetTokens, users, organizationMemberships, branchUsers, branches, branchJurisdictions, organizations, jurisdictionProfiles } from "../drizzle/schema";
import { hashAuditRecord, hashInternalPassword, hashSessionToken, isSessionEnvironmentConsistent, verifyInternalPassword } from "./domain/internal-auth";
import { ENV } from './_core/env';
import { safeErrorLabel } from './domain/safe-error';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, { schema, mode: "default" });
    } catch (error) {
      console.warn("[Database] Failed to connect:", safeErrorLabel(error));
      _db = null;
    }
  }
  return _db;
}

// Export a proxy or direct instance if available for simple scripts
export const db = drizzle(process.env.DATABASE_URL || "mysql://localhost:3306/medora", { schema, mode: "default" });

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

export async function getInternalCredentialByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(internalCredentials).where(eq(internalCredentials.username, username)).limit(1);
  return result[0];
}

const SHOWCASE_USERNAME = "test";
const SHOWCASE_OPEN_ID = "medora-showcase-internal-user-v1";
const SHOWCASE_ORGANIZATION_NAME = "MEDORA Investor Showcase";
const SHOWCASE_BRANCH_CODE = "MEDORA-SHOWCASE-001";

/**
 * Ensures the deliberately isolated, non-production showcase identity exists.
 * This path is idempotent, is available only for the fixed showcase username,
 * and derives the password hash from server-side secret management only.
 */
export async function ensureShowcaseAccount(username: string) {
  if (username !== SHOWCASE_USERNAME) return false;
  const configuredPassword = process.env.SHOWCASE_TEST_PASSWORD?.replace(/\r?\n/g, "");
  if (!configuredPassword) return false;

  const db = await getDb();
  if (!db) throw new Error("Showcase authentication requires a database");

  return db.transaction(async tx => {
    const credentialRows = await tx.select().from(internalCredentials).where(eq(internalCredentials.username, SHOWCASE_USERNAME)).limit(1);
    const existingCredential = credentialRows[0];
    if (existingCredential && existingCredential.accountType !== "showcase") {
      throw new Error("Reserved showcase username is not a showcase account");
    }

    let showcaseUserId = existingCredential?.userId;
    if (!showcaseUserId) {
      const existingUser = (await tx.select().from(users).where(eq(users.openId, SHOWCASE_OPEN_ID)).limit(1))[0];
      if (existingUser) {
        showcaseUserId = existingUser.id;
      } else {
        await tx.insert(users).values({
          openId: SHOWCASE_OPEN_ID,
          name: "MEDORA Showcase User",
          loginMethod: "internal_showcase",
          role: "manager",
          lastSignedIn: new Date(),
        });
        showcaseUserId = (await tx.select().from(users).where(eq(users.openId, SHOWCASE_OPEN_ID)).limit(1))[0]?.id;
      }
    }
    if (!showcaseUserId) throw new Error("Showcase user bootstrap failed");

    let showcaseOrganization = (await tx.select().from(organizations).where(and(
      eq(organizations.displayName, SHOWCASE_ORGANIZATION_NAME),
      eq(organizations.environment, "showcase"),
    )).limit(1))[0];
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

    let showcaseJurisdiction = (await tx.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.countryCode, "EG")).limit(1))[0];
    if (!showcaseJurisdiction) {
      await tx.insert(jurisdictionProfiles).values({
        countryCode: "EG",
        countryNameAr: "نطاق عرض غير تنظيمي",
        legalAuthorityProfile: "UNVERIFIED_AUTHORITY",
        language: "ar",
        defaultLocale: "ar-EG",
        currencyCode: "EGP",
        timezone: "Africa/Cairo",
        taxProfile: "SHOWCASE_NOT_REGULATORY",
        dateFormat: "dd/MM/yyyy",
        numberSystem: "latn",
        active: 0,
      });
      showcaseJurisdiction = (await tx.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.countryCode, "EG")).limit(1))[0];
    }
    if (!showcaseJurisdiction) throw new Error("Showcase jurisdiction bootstrap failed");

    await tx.insert(organizationMemberships).values({
      organizationId: showcaseOrganization.id,
      userId: showcaseUserId,
      organizationRole: "operations_manager",
      active: 1,
    }).onDuplicateKeyUpdate({ set: { organizationRole: "operations_manager", active: 1 } });
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
        username: SHOWCASE_USERNAME,
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
