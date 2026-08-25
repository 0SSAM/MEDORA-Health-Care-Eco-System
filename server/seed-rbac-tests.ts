// MEDORA | ميدورا — Integrated Health Care System
// RBAC Test Seeding Script
import "dotenv/config";
import { getDb } from "./db";
import { users, internalCredentials, organizations, organizationMemberships, branches, branchUsers } from "../drizzle/schema";
import { hashInternalPassword } from "./domain/internal-auth";
import { eq, and } from "drizzle-orm";

async function seed() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  console.log("Seeding RBAC test accounts...");

  // 1. Ensure Organization exists
  let orgId: number;
  const existingOrg = await db.select().from(organizations).where(eq(organizations.displayName, "MEDORA Test")).limit(1);
  if (existingOrg.length > 0) {
    orgId = existingOrg[0].id;
  } else {
    const [org] = await db.insert(organizations).values({
      organizationType: "pharmacy",
      legalName: "MEDORA Test Corp",
      displayName: "MEDORA Test",
      countryCode: "EGY",
      status: "active",
    });
    orgId = Number(org.insertId);
  }

  // 2. Ensure Branch exists
  let branchId: number;
  const existingBranch = await db.select().from(branches).where(eq(branches.code, "TEST-BR-01")).limit(1);
  if (existingBranch.length > 0) {
    branchId = existingBranch[0].id;
  } else {
    const [branch] = await db.insert(branches).values({
      organizationId: orgId,
      code: "TEST-BR-01",
      nameAr: "فرع الاختبار",
      active: 1,
    });
    branchId = Number(branch.insertId);
  }

  const testAccounts = [
    { username: "admin", role: "admin", orgRole: "owner" as const, password: "Admin#@!12345" },
    { username: "staff_user", role: "user", orgRole: "staff" as const, password: "Staff#@!12345" },
    { username: "auditor_user", role: "user", orgRole: "auditor" as const, password: "Auditor#@!12345" },
  ];

  for (const account of testAccounts) {
    let userId: number;
    const existingCred = await db.select().from(internalCredentials).where(eq(internalCredentials.username, account.username)).limit(1);
    
    if (existingCred.length > 0) {
      userId = existingCred[0].userId;
      console.log(`Updating existing account: ${account.username}`);
      await db.update(internalCredentials).set({
        passwordHash: hashInternalPassword(account.password),
        active: 1
      }).where(eq(internalCredentials.id, existingCred[0].id));
    } else {
      const [user] = await db.insert(users).values({
        openId: `test-${account.username}`,
        name: `Test ${account.username}`,
        role: account.role as any,
      });
      userId = Number(user.insertId);

      await db.insert(internalCredentials).values({
        userId,
        username: account.username,
        passwordHash: hashInternalPassword(account.password),
        active: 1,
        accountType: "employee",
      });
      console.log(`Created new account: ${account.username}`);
    }

    // Upsert Membership
    const existingMember = await db.select().from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, orgId), eq(organizationMemberships.userId, userId))).limit(1);
    if (existingMember.length > 0) {
      await db.update(organizationMemberships).set({ organizationRole: account.orgRole, active: 1 }).where(eq(organizationMemberships.id, existingMember[0].id));
    } else {
      await db.insert(organizationMemberships).values({
        organizationId: orgId,
        userId,
        organizationRole: account.orgRole,
        active: 1,
      });
    }

    // Upsert Branch Assignment
    const existingBranchUser = await db.select().from(branchUsers).where(and(eq(branchUsers.branchId, branchId), eq(branchUsers.userId, userId))).limit(1);
    if (!existingBranchUser.length) {
      await db.insert(branchUsers).values({
        branchId,
        userId,
        active: 1,
      });
    }
  }

  // CRITICAL: Scope resolution requires branchJurisdictions
  const jurisdictionId = 1; // Default EG jurisdiction
  const { branchJurisdictions } = await import("../drizzle/schema");
  const existingBJ = await db.select().from(branchJurisdictions).where(and(eq(branchJurisdictions.branchId, branchId), eq(branchJurisdictions.jurisdictionId, jurisdictionId))).limit(1);
  if (!existingBJ.length) {
    // Admin ID for confirmation
    const admin = (await db.select({ id: users.id }).from(internalCredentials).innerJoin(users, eq(users.id, internalCredentials.userId)).where(eq(internalCredentials.username, "admin")).limit(1))[0];
    await db.insert(branchJurisdictions).values({
      branchId,
      jurisdictionId,
      active: 1,
      confirmedByUserId: admin.id,
      confirmedAt: new Date(),
    });
  }

  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
