/** Provision the supplied El-Baz Pharmacy organization/branch identity without creating credentials. */
import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("EL_BAZ_PROVISION_ERROR: DATABASE_URL is required");
  process.exit(2);
}

const db = await mysql.createConnection(databaseUrl);
const PHARMACY = {
  legalName: "El-Baz Pharmacy",
  displayName: "El-Baz Pharmacy | صيدلية الباز",
  organizationType: "pharmacy",
  countryCode: "EG",
  address: "المنصوره، ميدان مشعل، بجوار كشري جدو",
  manager: "Dr. Nouran Tarek",
  landline: "0502243574",
  whatsapp: "01040716080",
};

try {
  const [orgRows] = await db.query("SELECT id FROM organizations WHERE legalName=? LIMIT 1", [PHARMACY.legalName]);
  let organizationId = orgRows[0]?.id;
  if (!organizationId) {
    const [result] = await db.query(
      "INSERT INTO organizations (organizationType,legalName,displayName,countryCode,status) VALUES (?,?,?,?,?)",
      [PHARMACY.organizationType, PHARMACY.legalName, PHARMACY.displayName, PHARMACY.countryCode, "active"],
    );
    organizationId = result.insertId;
  } else {
    await db.query("UPDATE organizations SET displayName=?, status='active' WHERE id=?", [PHARMACY.displayName, organizationId]);
  }

  const [branchRows] = await db.query("SELECT id FROM branches WHERE organizationId=? AND code='MAIN' LIMIT 1", [organizationId]);
  if (branchRows[0]?.id) {
    await db.query("UPDATE branches SET nameAr=?, address=?, active=1 WHERE id=?", ["El-Baz Pharmacy | صيدلية الباز", PHARMACY.address, branchRows[0].id]);
  } else {
    await db.query("INSERT INTO branches (organizationId,code,nameAr,address,active) VALUES (?,?,?,?,1)", [organizationId, "MAIN", "El-Baz Pharmacy | صيدلية الباز", PHARMACY.address]);
  }

  console.log(JSON.stringify({
    ok: true,
    organizationId,
    pharmacy: PHARMACY,
    note: "Business contact/manager data is represented in the pharmacy brand profile; no login credential was created by this script.",
  }, null, 2));
} catch (error) {
  console.error("EL_BAZ_PROVISION_ERROR:", error instanceof Error ? error.message : "UnknownError");
  process.exit(3);
} finally {
  await db.end();
}
