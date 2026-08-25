
import { getDb } from "./db";
import { internalCredentials, users, organizationMemberships, branchUsers, branches, organizations, branchJurisdictions, jurisdictionProfiles } from "../drizzle/schema";
import { hashInternalPassword } from "./domain/internal-auth";
import { eq, and } from "drizzle-orm";

async function resetOwner(username: string, password: string) {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  try {
    const ownerOpenId = process.env.OWNER_OPEN_ID;
    if (!ownerOpenId) {
      console.error("OWNER_OPEN_ID environment variable is not set");
      process.exit(1);
    }

    console.log(`Resetting owner credentials for username: ${username}`);
    
    await db.transaction(async (tx) => {
      // 1. Ensure user exists
      let user = (await tx.select().from(users).where(eq(users.openId, ownerOpenId)).limit(1))[0];
      if (!user) {
        console.log("Creating owner user...");
        await tx.insert(users).values({
          openId: ownerOpenId,
          name: "System Owner",
          role: "admin",
          loginMethod: "internal",
        });
        user = (await tx.select().from(users).where(eq(users.openId, ownerOpenId)).limit(1))[0];
      } else {
        await tx.update(users).set({ role: "admin" }).where(eq(users.id, user.id));
      }

      if (!user) throw new Error("Failed to create/find owner user");

      // 2. Ensure organization exists
      let org = (await tx.select().from(organizations).where(eq(organizations.displayName, "MEDORA Headquarters")).limit(1))[0];
      if (!org) {
        console.log("Creating head organization...");
        await tx.insert(organizations).values({
          organizationType: "pharmacy_chain",
          legalName: "MEDORA Integrated Health Systems Ltd.",
          displayName: "MEDORA Headquarters",
          countryCode: "EG",
          status: "active",
          environment: "production",
        });
        org = (await tx.select().from(organizations).where(eq(organizations.displayName, "MEDORA Headquarters")).limit(1))[0];
      }
      if (!org) throw new Error("Failed to create/find organization");

      // 3. Ensure branch exists
      let branch = (await tx.select().from(branches).where(eq(branches.organizationId, org.id)).limit(1))[0];
      if (!branch) {
        console.log("Creating main branch...");
        await tx.insert(branches).values({
          organizationId: org.id,
          code: "MEDORA-MAIN-001",
          nameAr: "الفرع الرئيسي - ميدورا",
          address: "Cairo, Egypt",
          active: 1,
        });
        branch = (await tx.select().from(branches).where(eq(branches.organizationId, org.id)).limit(1))[0];
      }
      if (!branch) throw new Error("Failed to create/find branch");

      // 4. Ensure jurisdiction exists
      let jurisdiction = (await tx.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.countryCode, "EG")).limit(1))[0];
      if (!jurisdiction) {
         console.log("Creating jurisdiction profile...");
         await tx.insert(jurisdictionProfiles).values({
            countryCode: "EG",
            countryNameAr: "مصر",
            legalAuthorityProfile: "EDA_EGYPT",
            language: "ar",
            defaultLocale: "ar-EG",
            currencyCode: "EGP",
            timezone: "Africa/Cairo",
            taxProfile: "EGYPT_VAT_2026",
            dateFormat: "dd/MM/yyyy",
            numberSystem: "latn",
            active: 1,
         });
         jurisdiction = (await tx.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.countryCode, "EG")).limit(1))[0];
      }
      if (!jurisdiction) throw new Error("Failed to create/find jurisdiction");

      // 5. Link user to org/branch/jurisdiction
      await tx.insert(organizationMemberships).values({
        organizationId: org.id,
        userId: user.id,
        organizationRole: "owner",
        active: 1,
      }).onDuplicateKeyUpdate({ set: { organizationRole: "owner", active: 1 } });

      await tx.insert(branchUsers).values({
        branchId: branch.id,
        userId: user.id,
        active: 1,
      }).onDuplicateKeyUpdate({ set: { active: 1 } });

      await tx.insert(branchJurisdictions).values({
        branchId: branch.id,
        jurisdictionId: jurisdiction.id,
        locationSource: "manual_override",
        confirmedByUserId: user.id,
      }).onDuplicateKeyUpdate({ set: { confirmedByUserId: user.id, confirmedAt: new Date() } });

      // 6. Set credentials
      const passwordHash = hashInternalPassword(password);
      const existingCred = (await tx.select().from(internalCredentials).where(eq(internalCredentials.userId, user.id)).limit(1))[0];

      if (existingCred) {
        console.log("Updating existing credentials...");
        await tx.update(internalCredentials).set({
          username,
          passwordHash,
          failedAttempts: 0,
          lockedUntil: null,
          active: 1,
          passwordChangedAt: new Date(),
        }).where(eq(internalCredentials.id, existingCred.id));
      } else {
        console.log("Creating new credentials...");
        await tx.insert(internalCredentials).values({
          userId: user.id,
          username,
          passwordHash,
          failedAttempts: 0,
          lockedUntil: null,
          active: 1,
          accountType: "employee",
        });
      }
    });

    console.log("Owner credentials successfully reset.");
  } catch (error) {
    console.error("Failed to reset owner credentials:", error);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error("Usage: ts-node reset-owner.ts <username> <password>");
  process.exit(1);
}

resetOwner(args[0], args[1]);
