/** Provision the supplied El-Baz Pharmacy organization/branch identity without creating credentials. */
import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("EL_BAZ_PROVISION_ERROR: DATABASE_URL is required");
  process.exit(2);
}

const db = await mysql.createConnection(databaseUrl);
const PHARMACY = {
  key: "el-baz-pharmacy",
  legalName: "El-Baz Pharmacy",
  displayNameEn: "El-Baz Pharmacy",
  displayNameAr: "صيدلية الباز",
  displayName: "El-Baz Pharmacy | صيدلية الباز",
  organizationType: "pharmacy",
  countryCode: "EG",
  addressAr: "المنصوره، ميدان مشعل، بجوار كشري جدو",
  addressEn: "Mansoura, Mishaal Square, next to Koshary Gedo",
  manager: "Dr. Nouran Tarek",
  landline: "0502243574",
  whatsapp: "01040716080",
  logoPath: "/branding/el-baz-pharmacy-logo.svg",
  backgroundPath: "/branding/el-baz-pharmacy-background.svg",
};

try {
  const [orgRows] = await db.query("SELECT id FROM organizations WHERE legalName=? LIMIT 1", [PHARMACY.legalName]);
  let organizationId = Number(orgRows[0]?.id ?? 0);
  if (!organizationId) {
    const [result] = await db.query(
      "INSERT INTO organizations (organizationType,legalName,displayName,countryCode,status) VALUES (?,?,?,?,?)",
      [PHARMACY.organizationType, PHARMACY.legalName, PHARMACY.displayName, PHARMACY.countryCode, "active"],
    );
    organizationId = Number(result.insertId);
  } else {
    await db.query("UPDATE organizations SET organizationType=?, displayName=?, countryCode=?, status='active' WHERE id=?", [PHARMACY.organizationType, PHARMACY.displayName, PHARMACY.countryCode, organizationId]);
  }

  const [branchRows] = await db.query("SELECT id FROM branches WHERE organizationId=? AND code='MAIN' LIMIT 1", [organizationId]);
  let branchId = Number(branchRows[0]?.id ?? 0);
  if (branchId) {
    await db.query("UPDATE branches SET nameAr=?, address=?, active=1 WHERE id=?", [PHARMACY.displayName, PHARMACY.addressAr, branchId]);
  } else {
    const [result] = await db.query("INSERT INTO branches (organizationId,code,nameAr,address,active) VALUES (?,?,?,?,1)", [organizationId, "MAIN", PHARMACY.displayName, PHARMACY.addressAr]);
    branchId = Number(result.insertId);
  }

  await db.query(
    `INSERT INTO pharmacy_profiles
      (organizationId,branchId,pharmacyKey,legalName,displayNameEn,displayNameAr,managerName,addressAr,addressEn,landline,whatsapp,logoPath,backgroundPath,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       legalName=VALUES(legalName), displayNameEn=VALUES(displayNameEn), displayNameAr=VALUES(displayNameAr),
       managerName=VALUES(managerName), addressAr=VALUES(addressAr), addressEn=VALUES(addressEn),
       landline=VALUES(landline), whatsapp=VALUES(whatsapp), logoPath=VALUES(logoPath), backgroundPath=VALUES(backgroundPath), status='active'`,
    [organizationId, branchId, PHARMACY.key, PHARMACY.legalName, PHARMACY.displayNameEn, PHARMACY.displayNameAr, PHARMACY.manager, PHARMACY.addressAr, PHARMACY.addressEn, PHARMACY.landline, PHARMACY.whatsapp, PHARMACY.logoPath, PHARMACY.backgroundPath, "active"],
  );

  console.log(JSON.stringify({
    ok: true,
    organizationId,
    branchId,
    pharmacy: PHARMACY,
    persistedProfile: true,
    note: "Business identity is persisted without creating login credentials or inventing regulatory credentials.",
  }, null, 2));
} catch (error) {
  console.error("EL_BAZ_PROVISION_ERROR:", error instanceof Error ? error.message : "UnknownError");
  process.exit(3);
} finally {
  await db.end();
}
