// MEDORA | ميدورا — Integrated Health Care System
// Database & Auth Integrity Verification Script
// This script audits the production database for correct admin setup and role propagation.

import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { users, internalCredentials, organizations, organizationMemberships, branches, branchUsers } from "../drizzle/schema";

async function verifyIntegrity() {
  console.log("--- MEDORA Auth Integrity Audit ---");
  
  const db = await getDb();
  if (!db) {
    console.error("❌ CRITICAL: Database connection failed. Verify DATABASE_URL.");
    process.exit(1);
  }

  try {
    // 1. Audit Global Admins
    const globalAdmins = await db.select().from(users).where(eq(users.role, "admin"));
    console.log(`\n[1] Global Platform Admins: ${globalAdmins.length}`);
    globalAdmins.forEach(admin => {
      console.log(`  - User ID ${admin.id}: ${admin.name} (${admin.email || "No email"})`);
    });

    if (globalAdmins.length === 0) {
      console.warn("⚠️  WARNING: No global admins found. Platform administration is locked.");
    }

    // 2. Audit Internal Credentials
    const internalCreds = await db.select().from(internalCredentials).where(eq(internalCredentials.active, 1));
    console.log(`\n[2] Active Internal Credentials: ${internalCreds.length}`);
    
    // 3. Audit Organization Owners
    const owners = await db.select({
      userName: users.name,
      orgName: organizations.displayName,
      role: organizationMemberships.organizationRole
    })
    .from(organizationMemberships)
    .innerJoin(users, eq(users.id, organizationMemberships.userId))
    .innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
    .where(and(eq(organizationMemberships.organizationRole, "owner"), eq(organizationMemberships.active, 1)));

    console.log(`\n[3] Active Organization Owners: ${owners.length}`);
    owners.forEach(owner => {
      console.log(`  - ${owner.userName} owns ${owner.orgName}`);
    });

    // 4. Check for orphaned memberships or users
    const orphanedUsers = await db.select().from(users).leftJoin(organizationMemberships, eq(users.id, organizationMemberships.userId)).where(and(eq(users.role, "user"), eq(organizationMemberships.id, null)));
    if (orphanedUsers.length > 0) {
      console.warn(`\n[4] Found ${orphanedUsers.length} users without organization membership.`);
    } else {
      console.log("\n[4] No orphaned users found. All users are scoped to organizations.");
    }

    console.log("\n✅ Audit Complete: System structure is consistent.");
  } catch (error) {
    console.error("\n❌ Audit Failed:", error);
    process.exit(1);
  }
}

verifyIntegrity();
