#!/usr/bin/env node
import fs from "node:fs/promises";
import crypto from "node:crypto";
import process from "node:process";
import mysql from "mysql2/promise";

const DEFAULT_FILES = [
  "/home/ubuntu/medora-catalog-research/derived/medicines-pending-review.csv",
  "/home/ubuntu/medora-catalog-research/derived/cosmetics-pending-review.csv",
  "/home/ubuntu/medora-catalog-research/derived/medical-equipment-supplies-leads-pending-review.csv",
];

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    args[key] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
  }
  return args;
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"' && field.length === 0) quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += char;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const headers = (rows.shift() ?? []).map(h => h.replace(/^\uFEFF/, "").trim());
  return rows.filter(r => r.some(Boolean)).map(r => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? "").trim()])));
}

function clean(value) {
  const normalized = String(value ?? "").trim();
  return normalized && normalized.toLowerCase() !== "null" ? normalized : null;
}

function sha(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
function categoryOf(raw) {
  if (raw === "medicine") return "medicine";
  if (raw === "cosmetic_or_personal_care") return "cosmetic";
  return "medical_supply";
}
function toRow(source, organizationId, jurisdictionId, userId) {
  const category = categoryOf(source.catalog_type);
  const nameEn = clean(source.name_en);
  const nameAr = clean(source.name_ar) ?? nameEn ?? `UNNAMED-${sha(JSON.stringify(source)).slice(0, 16)}`;
  const barcode = clean(source.barcode);
  const gtin = clean(source.gtin);
  const sourceRecordId = sha([source.source_url, source.catalog_type, nameEn, nameAr, source.manufacturer, barcode, gtin].map(v => clean(v) ?? "").join("|")).slice(0, 64);
  const sku = `LOCAL-${organizationId}-${category.toUpperCase()}-${sourceRecordId.slice(0, 20)}`;
  const price = clean(source.price_egp);
  return {
    jurisdictionId, organizationId, category, sku, barcode, gtin,
    priceEgp: price && /^\d+(\.\d{1,2})?$/.test(price) ? price : null,
    nameAr, nameEn, genericName: clean(source.active_ingredient), manufacturer: clean(source.manufacturer),
    registrationNumber: null, sourceAuthority: "LOCAL_STARTER", sourceRecordId,
    sourceUrl: clean(source.source_url), sourceRetrievedAt: clean(source.source_date) ? new Date(source.source_date) : null,
    sourceLicense: clean(source.source_license), sourceNotes: clean(source.notes),
    verificationStatus: "PENDING_REVIEW", createdByUserId: userId,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const organizationId = Number(args["organization-id"]);
  const branchId = Number(args["branch-id"]);
  const jurisdictionId = Number(args["jurisdiction-id"]);
  const userId = Number(args["user-id"]);
  const files = args.file ? [String(args.file)] : DEFAULT_FILES;
  const commit = args.commit === true;
  if (![organizationId, branchId, jurisdictionId, userId].every(Number.isInteger)) {
    throw new Error("Required: --organization-id --branch-id --jurisdiction-id --user-id");
  }
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    const [[org]] = await connection.query("SELECT id, status, environment FROM organizations WHERE id=? LIMIT 1", [organizationId]);
    const [[branch]] = await connection.query("SELECT id, organizationId, active FROM branches WHERE id=? LIMIT 1", [branchId]);
    const [[jurisdiction]] = await connection.query("SELECT id, countryCode, active FROM jurisdiction_profiles WHERE id=? LIMIT 1", [jurisdictionId]);
    const [[binding]] = await connection.query("SELECT branchId, jurisdictionId FROM branch_jurisdictions WHERE branchId=? AND jurisdictionId=? LIMIT 1", [branchId, jurisdictionId]);
    const [[user]] = await connection.query("SELECT id FROM users WHERE id=? LIMIT 1", [userId]);
    if (!org || org.status !== "active" || org.environment !== "production") throw new Error("Target organization must be active production; showcase is refused.");
    if (!branch || Number(branch.organizationId) !== organizationId || !branch.active) throw new Error("Branch is not active or outside organization scope.");
    if (!jurisdiction || !jurisdiction.active || !binding) throw new Error("Active jurisdiction and branch binding are required.");
    if (!user) throw new Error("Import actor does not exist.");

    const rows = [];
    for (const file of files) {
      const parsed = parseCsv(await fs.readFile(file, "utf8"));
      rows.push(...parsed.map(source => toRow(source, organizationId, jurisdictionId, userId)));
    }
    const unique = new Map(rows.map(row => [row.sourceRecordId, row]));
    console.log(JSON.stringify({ mode: commit ? "commit" : "dry-run", files, parsed: rows.length, unique: unique.size, status: "PENDING_REVIEW", organizationId, branchId, jurisdictionId }, null, 2));
    if (!commit) return;

    await connection.beginTransaction();
    let inserted = 0, skipped = 0;
    for (const row of unique.values()) {
      const [existing] = await connection.query("SELECT id FROM catalog_items WHERE organizationId=? AND sourceAuthority=? AND sourceRecordId=? LIMIT 1", [organizationId, row.sourceAuthority, row.sourceRecordId]);
      if (existing.length) { skipped += 1; continue; }
      const [result] = await connection.query(
        "INSERT INTO catalog_items (jurisdictionId, organizationId, category, sku, barcode, gtin, priceEgp, nameAr, nameEn, genericName, manufacturer, registrationNumber, sourceAuthority, sourceRecordId, sourceUrl, sourceRetrievedAt, sourceLicense, sourceNotes, verificationStatus, createdByUserId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [row.jurisdictionId, row.organizationId, row.category, row.sku, row.barcode, row.gtin, row.priceEgp, row.nameAr, row.nameEn, row.genericName, row.manufacturer, row.registrationNumber, row.sourceAuthority, row.sourceRecordId, row.sourceUrl, row.sourceRetrievedAt, row.sourceLicense, row.sourceNotes, row.verificationStatus, row.createdByUserId],
      );
      const itemId = result.insertId;
      await connection.query("INSERT INTO catalog_sync_queue (jurisdictionId, organizationId, entityType, operation, entityId, idempotencyKey, payloadJson, status, createdByUserId) VALUES (?,?,?,?,?,?,?,?,?)", [row.jurisdictionId, row.organizationId, row.category, "create", itemId, `starter-${row.sourceRecordId}`, JSON.stringify(row), "pending", row.createdByUserId]);
      inserted += 1;
    }
    await connection.commit();
    console.log(JSON.stringify({ inserted, skipped, status: "PENDING_REVIEW", authoritative: false }, null, 2));
  } catch (error) {
    try { await connection.rollback(); } catch {}
    throw error;
  } finally { await connection.end(); }
}

main().catch(error => { console.error(`[starter-import] ${error.message}`); process.exitCode = 1; });
