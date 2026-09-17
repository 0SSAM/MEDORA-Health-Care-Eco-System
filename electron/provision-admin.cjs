const mysql = require("mysql2/promise");
const { randomBytes, scryptSync } = require("node:crypto");

function encodeBase64Url(buffer) {
  return Buffer.from(buffer).toString("base64url").replace(/=+$/, "");
}

function hashBootstrapPassword(password) {
  // Explicit one-time desktop bootstrap exception requested for the local system-manager account.
  // Normal password changes still go through the application's password policy.
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64, { N: 16_384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${encodeBase64Url(salt)}$${encodeBase64Url(derived)}`;
}

async function columns(db, table) {
  const [rows] = await db.query(`SHOW COLUMNS FROM \`${table}\``);
  return rows;
}

async function enumValues(db, table, column) {
  const rows = await columns(db, table);
  const item = rows.find(row => row.Field === column);
  if (!item) return [];
  const match = String(item.Type).match(/^enum\((.*)\)$/);
  return match ? [...match[1].matchAll(/'([^']+)'/g)].map(matchItem => matchItem[1]) : [];
}

async function one(db, statement, params = []) {
  const [rows] = await db.query(statement, params);
  return rows[0] || null;
}

async function insert(db, table, data) {
  const tableColumns = await columns(db, table);
  const allowed = new Set(tableColumns.map(column => column.Field));
  const values = Object.fromEntries(Object.entries(data).filter(([key]) => allowed.has(key)));
  const keys = Object.keys(values);
  if (!keys.length) throw new Error(`No compatible columns found for ${table}`);
  const placeholders = keys.map(() => "?").join(",");
  const [result] = await db.query(
    `INSERT INTO \`${table}\` (${keys.map(key => `\`${key}\``).join(",")}) VALUES (${placeholders})`,
    keys.map(key => values[key] ?? null),
  );
  return Number(result.insertId);
}

async function provisionDesktopAdmin(databaseUrl) {
  if (!databaseUrl) throw new Error("DATABASE_URL is required for desktop admin provisioning");
  const db = await mysql.createConnection(databaseUrl);
  try {
    const existing = await one(db, "SELECT id FROM internal_credentials WHERE username=? LIMIT 1", ["admin"]);
    if (existing) return { created: false, username: "admin" };

    const organizationTypes = await enumValues(db, "organizations", "organizationType");
    const organizationId = Number(
      (await one(db, "SELECT id FROM organizations WHERE legalName=? LIMIT 1", ["MEDORA Admin Organization"]))?.id ||
      await insert(db, "organizations", {
        organizationType: organizationTypes.includes("pharmacy") ? "pharmacy" : organizationTypes[0] || "pharmacy",
        legalName: "MEDORA Admin Organization",
        displayName: "MEDORA Admin",
        countryCode: "EG",
        status: "active",
      }),
    );

    const countryCodes = await enumValues(db, "jurisdiction_profiles", "countryCode");
    const currencies = await enumValues(db, "jurisdiction_profiles", "currencyCode");
    const jurisdictionId = Number(
      (await one(db, "SELECT id FROM jurisdiction_profiles WHERE countryCode=? LIMIT 1", ["EG"]))?.id ||
      await insert(db, "jurisdiction_profiles", {
        countryCode: countryCodes.includes("EG") ? "EG" : countryCodes[0] || "EG",
        countryNameAr: "مصر",
        defaultLocale: "ar",
        currencyCode: currencies.includes("EGP") ? "EGP" : currencies[0] || "EGP",
        timezone: "Africa/Cairo",
        taxProfile: "STANDARD",
        dateFormat: "YYYY-MM-DD",
        numberSystem: "latn",
        active: 1,
      }),
    );

    const branchId = Number(
      (await one(db, "SELECT id FROM branches WHERE organizationId=? LIMIT 1", [organizationId]))?.id ||
      await insert(db, "branches", {
        organizationId,
        code: "MAIN",
        nameAr: "الفرع الرئيسي",
        active: 1,
      }),
    );

    const userId = Number(
      (await one(db, "SELECT id FROM users WHERE openId=? LIMIT 1", ["seed-admin"]))?.id ||
      await insert(db, "users", {
        openId: "seed-admin",
        name: "MEDORA System Manager",
        email: "admin@medora.local",
        role: "admin",
        loginMethod: "internal",
      }),
    );
    await db.query("UPDATE users SET role='admin', loginMethod='internal' WHERE id=?", [userId]);

    const organizationRoles = await enumValues(db, "organization_memberships", "organizationRole");
    const organizationRole = organizationRoles.includes("owner") ? "owner" : organizationRoles[0] || "staff";
    if (!(await one(db, "SELECT id FROM organization_memberships WHERE organizationId=? AND userId=? LIMIT 1", [organizationId, userId]))) {
      await insert(db, "organization_memberships", { organizationId, userId, organizationRole, active: 1 });
    }
    if (!(await one(db, "SELECT id FROM branch_users WHERE branchId=? AND userId=? LIMIT 1", [branchId, userId]))) {
      await insert(db, "branch_users", { branchId, userId, active: 1 });
    }

    const locationSources = await enumValues(db, "branch_jurisdictions", "locationSource");
    if (!(await one(db, "SELECT id FROM branch_jurisdictions WHERE branchId=? LIMIT 1", [branchId]))) {
      await insert(db, "branch_jurisdictions", {
        branchId,
        jurisdictionId,
        locationSource: locationSources.includes("admin_confirmed") ? "admin_confirmed" : locationSources[0] || "admin_confirmed",
        confirmedByUserId: userId,
      });
    }

    const passwordHash = hashBootstrapPassword("admin");
    const credential = await one(db, "SELECT id FROM internal_credentials WHERE userId=? LIMIT 1", [userId]);
    if (credential) {
      await db.query("UPDATE internal_credentials SET username='admin', passwordHash=?, active=1, failedAttempts=0, lockedUntil=NULL WHERE id=?", [passwordHash, credential.id]);
    } else {
      await insert(db, "internal_credentials", {
        userId,
        username: "admin",
        passwordHash,
        failedAttempts: 0,
        active: 1,
      });
    }

    return { created: true, username: "admin", userId, organizationId, branchId, jurisdictionId };
  } finally {
    await db.end();
  }
}

module.exports = { provisionDesktopAdmin };
