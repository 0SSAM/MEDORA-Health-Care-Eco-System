// MEDORA | ميدورا — Integrated Health Care System
// Automated System Bootstrap & Admin Provisioning
// This script runs on startup to ensure DB connectivity and Admin account presence.

import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { users, internalCredentials, organizations, organizationMemberships, branches, branchUsers, branchJurisdictions, jurisdictionProfiles } from "../drizzle/schema";
import { hashInternalPassword, normalizeInternalUsername } from "./domain/internal-auth";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";

export type BootstrapProvisioningCredentials = {
  username: string;
  password: string;
};

export function getBootstrapProvisioningCredentials(
  environment: NodeJS.ProcessEnv = process.env,
): BootstrapProvisioningCredentials | null {
  if (environment.MEDORA_BOOTSTRAP_ALLOW_PROVISIONING !== "true") {
    return null;
  }

  const username = environment.MEDORA_BOOTSTRAP_ADMIN_USERNAME?.trim();
  const password = environment.MEDORA_BOOTSTRAP_ADMIN_PASSWORD;
  return username && password ? { username, password } : null;
}

export async function bootstrapSystem(environment: NodeJS.ProcessEnv = process.env) {
  console.log("🚀 Starting MEDORA System Bootstrap...");

  const credentials = getBootstrapProvisioningCredentials(environment);
  if (!credentials) {
    console.info("MEDORA startup provisioning is disabled; an explicit runtime provisioning configuration is required.");
    return;
  }

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

    const normalizedUsername = normalizeInternalUsername(credentials.username);

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
        countryNameAr: "مصر",
        defaultLocale: "ar-EG",
        currencyCode: "EGP",
        timezone: "Africa/Cairo",
        taxProfile: "UNVERIFIED",
        dateFormat: "yyyy-MM-dd",
        active: 0,
      });
      const jurId = Number(jurResult[0].insertId);

      // Create Branch
      const branchResult = await tx.insert(branches).values({
        organizationId: orgId,
        code: "HQ-001",
        nameAr: "فرع القاهرة الرئيسي",
        active: 1
      });
      const branchId = Number(branchResult[0].insertId);

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
        passwordHash: hashInternalPassword(credentials.password),
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

      // This explicit operator-run provisioning creates no approved country pack.
      // Keep the jurisdiction inactive, while preserving the auditable scope link.
      await tx.insert(branchJurisdictions).values({
        branchId,
        jurisdictionId: jurId,
        locationSource: "manual_override",
        confirmedByUserId: userId,
      });
    });

    console.log("✨ Default Admin provisioned successfully.");
    console.log("⚠️  Provisioning credentials are never logged; rotate the configured password according to the approved access policy.");

  } catch (error) {
    console.error("❌ Bootstrap Failed:", error);
  }
}

function isDirectExecution(): boolean {
  const invokedPath = process.argv[1];
  return Boolean(invokedPath) && import.meta.url === pathToFileURL(invokedPath).href;
}

if (isDirectExecution()) {
  bootstrapSystem().catch(error => {
    console.error("❌ Bootstrap Failed:", error);
    process.exitCode = 1;
  });
}
