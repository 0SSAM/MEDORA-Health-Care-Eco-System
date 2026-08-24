// MEDORA | ميدورا — Integrated Health Care System
// Automated System Bootstrap & Admin Provisioning
// This script runs on startup to ensure DB connectivity and Admin account presence.

import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { users, internalCredentials, organizations, organizationMemberships, branches, branchUsers, branchJurisdictions, jurisdictionProfiles } from "../drizzle/schema";
import { hashInternalPassword, normalizeInternalUsername } from "./domain/internal-auth";
import { randomUUID } from "node:crypto";

export async function bootstrapSystem() {
  console.log("🚀 Starting MEDORA System Bootstrap...");

  const db = await getDb();
  if (!db) {
    console.warn("⚠️  WARNING: Database not connected. Skipping automated provisioning.");
    return;
  }

  try {
    // 1. Check for any Admin user
    const existingAdmin = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log("✅ Admin account verified. System is ready.");
      return;
    }

    console.log("🛠️  No Admin account found. Provisioning default Admin...");

    const defaultUsername = "Admin";
    const defaultPassword = "Admin#@!12345"; // Should be changed on first login
    const normalizedUsername = normalizeInternalUsername(defaultUsername);

    await db.transaction(async (tx) => {
      // Create Organization
      const orgResult = await tx.insert(organizations).values({
        organizationType: "hospital",
        legalName: "MEDORA Headquarters",
        displayName: "ميدورا - المركز الرئيسي",
        countryCode: "EG",
        status: "active",
        environment: "production"
      });
      const orgId = Number(orgResult[0].insertId);

      // Create Jurisdiction
      const jurResult = await tx.insert(jurisdictionProfiles).values({
        countryCode: "EG",
        jurisdictionName: "القاهرة",
        active: 1
      });
      const jurId = Number(jurResult[0].insertId);

      // Create Branch
      const branchResult = await tx.insert(branches).values({
        organizationId: orgId,
        code: "HQ-001",
        nameAr: "فرع القاهرة الرئيسي",
        nameEn: "Main Cairo Branch",
        active: 1
      });
      const branchId = Number(branchResult[0].insertId);

      // Link Branch to Jurisdiction
      await tx.insert(branchJurisdictions).values({
        branchId,
        jurisdictionId: jurId,
        active: 1
      });

      // Create User
      const userResult = await tx.insert(users).values({
        openId: `internal-${randomUUID()}`,
        name: "System Administrator",
        role: "admin",
        loginMethod: "internal"
      });
      const userId = Number(userResult[0].insertId);

      // Create Credentials
      await tx.insert(internalCredentials).values({
        userId,
        username: normalizedUsername,
        passwordHash: hashInternalPassword(defaultPassword),
        accountType: "employee",
        active: 1
      });

      // Create Membership
      await tx.insert(organizationMemberships).values({
        userId,
        organizationId: orgId,
        organizationRole: "owner",
        active: 1
      });

      // Link User to Branch
      await tx.insert(branchUsers).values({
        userId,
        branchId,
        active: 1
      });
    });

    console.log("✨ Default Admin provisioned successfully.");
    console.log(`👤 Username: ${defaultUsername}`);
    console.log(`🔑 Password: ${defaultPassword}`);
    console.log("⚠️  IMPORTANT: Please change the password immediately after first login.");

  } catch (error) {
    console.error("❌ Bootstrap Failed:", error);
  }
}

// If run directly
if (require.main === module) {
  bootstrapSystem();
}
