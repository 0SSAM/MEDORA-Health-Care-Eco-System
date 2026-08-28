#!/usr/bin/env node
/**
 * seed-rbac-and-roles.mjs — بذرة الأدوار والصلاحيات وربط مدراء المنشآت
 * حزمة ترقية MEDORA 2026-08-28.
 *
 * الاستخدام:
 *   DATABASE_URL="mysql://medora:medora@127.0.0.1:3306/medora" \
 *     node scripts/seed-rbac-and-roles.mjs
 *
 * خصائص: idempotent (لا يكرر ولا يمس البيانات الموجودة)،
 * يعمل على جدول rbac_* (يجب تشغيل drizzle-kit migrate أولاً).
 * ملاحظة: قيمة organization_role للربط تُقرأ ديناميكيًا من القاعدة
 * حتى لا يُفترض اسم enum غير موجود.
 */
import mysql from "mysql2/promise";

const db = await mysql.createConnection(
  process.env.DATABASE_URL || "mysql://medora:medora@127.0.0.1:3306/medora"
);

const MODULES = ["crm", "erp", "hr", "pos", "inventory", "pharmacy", "procurement", "insurance", "reports", "ai", "admin", "settings"];
const ACTIONS = ["view", "create", "update", "delete", "approve", "export"];

const PERMS = [];
for (const m of MODULES) for (const a of ACTIONS) PERMS.push({ code: `${m}.${a}`, module: m, nameAr: `${m} — ${a}`, nameEn: `${m}.${a}` });
PERMS.push({ code: "*", module: "all", nameAr: "كل الصلاحيات (سوبر)", nameEn: "all permissions" });

const ROLES = [
  { code: "super_admin", nameAr: "مشرف النظام", nameEn: "Super Admin", perms: ["*"] },
  {
    code: "org_admin", nameAr: "مدير المنشأة", nameEn: "Org Admin",
    perms: MODULES.flatMap((m) => [`${m}.view`, `${m}.create`, `${m}.update`, `${m}.approve`, `${m}.export`])
      .concat(["admin.view", "admin.create", "admin.update", "settings.view", "settings.update"]),
  },
  {
    code: "manager", nameAr: "مدير تشغيلي", nameEn: "Manager",
    perms: MODULES.flatMap((m) => [`${m}.view`]).concat(["pos.create", "pos.update", "erp.approve", "hr.view", "crm.create", "reports.view", "reports.export"]),
  },
  {
    code: "accountant", nameAr: "محاسب", nameEn: "Accountant",
    perms: ["erp.view", "erp.create", "erp.update", "erp.export", "reports.view", "reports.export", "procurement.view", "pos.view"],
  },
  {
    code: "pharmacist", nameAr: "صيدلي", nameEn: "Pharmacist",
    perms: ["pharmacy.view", "pharmacy.create", "pharmacy.update", "inventory.view", "inventory.update", "pos.view", "pos.create"],
  },
  {
    code: "cashier", nameAr: "كاشير", nameEn: "Cashier",
    perms: ["pos.view", "pos.create", "pos.update", "inventory.view", "customer.view"],
  },
  {
    code: "hr_officer", nameAr: "موارد بشرية", nameEn: "HR Officer",
    perms: ["hr.view", "hr.create", "hr.update", "hr.approve", "reports.view"],
  },
  {
    code: "doctor", nameAr: "طبيب", nameEn: "Doctor",
    perms: ["healthcare.view", "healthcare.create", "pharmacy.view", "pos.view"],
  },
  {
    code: "nurse", nameAr: "تمريض", nameEn: "Nurse",
    perms: ["healthcare.view", "healthcare.create"],
  },
  {
    code: "auditor", nameAr: "مدقق", nameEn: "Auditor",
    perms: MODULES.flatMap((m) => [`${m}.view`]).concat(["reports.view", "reports.export", "ai.view"]),
  },
];

const q = async (sql, p = []) => (await db.query(sql, p))[0];
const permId = {};

async function ensurePerms() {
  for (const p of PERMS) {
    const rows = await q("SELECT id FROM rbac_permissions WHERE code=?", [p.code]);
    if (rows[0]) { permId[p.code] = rows[0].id; continue; }
    const [ins] = await db.query("INSERT INTO rbac_permissions (code,module,name_ar,name_en) VALUES (?,?,?,?)", [p.code, p.module, p.nameAr, p.nameEn]);
    permId[p.code] = ins.insertId;
  }
  console.log("[permissions]", Object.keys(permId).length);
}

async function ensureRoles() {
  const orgs = await q("SELECT id FROM organizations");
  for (const o of orgs) {
    for (const r of ROLES) {
      let roleId;
      const exist = await q("SELECT id FROM rbac_roles WHERE organization_id=? AND code=?", [o.id, r.code]);
      if (exist[0]) roleId = exist[0].id;
      else {
        const [ins] = await db.query("INSERT INTO rbac_roles (organization_id,code,name_ar,name_en,is_system) VALUES (?,?,?,?,1)", [o.id, r.code, r.nameAr, r.nameEn]);
        roleId = ins.insertId;
      }
      for (const pc of r.perms) {
        const pid = permId[pc];
        if (!pid) continue;
        await q("INSERT IGNORE INTO rbac_role_permissions (role_id,permission_id) VALUES (?,?)", [roleId, pid]);
      }
    }
    console.log("[roles] org", o.id, "←", ROLES.length);
  }
}

async function assignAdmins() {
  const cols = await q("SHOW COLUMNS FROM organization_memberships");
  const col = (n) => { const c = cols.find((x) => x.Field.toLowerCase() === n.toLowerCase()); return c ? "`" + c.Field + "`" : null; };
  const orgCol = col("organizationId"), userCol = col("userId"), roleCol = col("organizationRole");
  if (!orgCol || !userCol || !roleCol) { console.log("[assign-admins] أعمدة غير مكتملة"); return; }
  const roleVals = await q("SELECT DISTINCT " + roleCol + " AS rv FROM organization_memberships");
  const adminVal = roleVals[0]?.rv;
  if (!adminVal) { console.log("[assign-admins] لا أعضاء"); return; }
  const rows = await q("SELECT " + orgCol + " orgId, " + userCol + " uid FROM organization_memberships WHERE " + roleCol + "=?", [adminVal]);
  let n = 0;
  for (const r of rows) {
    const role = await q("SELECT id FROM rbac_roles WHERE organization_id=? AND code='org_admin'", [r.orgId]);
    if (role[0]) {
      await q("INSERT IGNORE INTO rbac_user_roles (organization_id,user_id,role_id) VALUES (?,?,?)", [r.orgId, r.uid, role[0].id]);
      n++;
    }
  }
  console.log("[assign-admins]", n, "عبر", roleCol, "=", adminVal);
}

await ensurePerms();
await ensureRoles();
await assignAdmins();

const [[s]] = await q("SELECT COUNT(*) c FROM rbac_permissions");
const [[t]] = await q("SELECT COUNT(*) c FROM rbac_roles");
const [[u]] = await q("SELECT COUNT(*) c FROM rbac_user_roles");
console.log(`[done] permissions=${s.c} roles=${t.c} user_roles=${u.c}`);
await db.end();
