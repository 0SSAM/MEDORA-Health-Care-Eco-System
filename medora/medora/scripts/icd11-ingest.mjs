#!/usr/bin/env node
/**
 * icd11-ingest.mjs — WHO ICD-API → MEDORA ingestion (v2, JSON-LD)
 *
 * المراجع الرسمية:
 *   - ICD Schema: https://icd.who.int/docs/icd-api/ICD-Schema/
 *   - Local Deployment: https://icd.who.int/docs/icd-api/ICDAPI-LocalDeployment/
 *
 * الاستخدام:
 *   # السحابة (تتطلب مفاتيح مجانية من icd.who.int/icdapi):
 *   ICD11_CLIENT_ID=... ICD11_CLIENT_SECRET=... DATABASE_URL=... node scripts/icd11-ingest.mjs
 *   # حاوية محلية (بدون OAuth — حسب وثيقة النشر المحلي):
 *   ICD11_BASE_URL=http://localhost:8080/icd DATABASE_URL=... node scripts/icd11-ingest.mjs
 *
 * خيارات:
 *   --smoke            اختبار محدود: جذر واحد + 12 كيانًا ثم توقف
 *   --dry-run          تحقق من الإعداد واطبع خطة التعيين دون شبكة/قاعدة
 *   --limit N          حد أقصى للكيانات المدرجة (استئناف آمن)
 *   --release 2024-01  إصدار الخطية (الافتراضي 2024-01)
 *   --lang en          لغة العنوان (الافتراضي en)
 *   --state file       ملف حالة للاستئناف (الافتراضي /tmp/icd11-ingest-state.json)
 */
import mysql from "mysql2/promise";

const argv = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : dflt;
};
const has = (name) => argv.includes(name);

const CFG = {
  dbUrl: process.env.DATABASE_URL || "mysql://medora:medora@127.0.0.1:3306/medora",
  base: process.env.ICD11_BASE_URL || "https://id.who.int/icd",
  apiVersion: process.env.ICD11_API_VERSION || "v2",
  clientId: process.env.ICD11_CLIENT_ID || "",
  clientSecret: process.env.ICD11_CLIENT_SECRET || "",
  tokenUrl: process.env.ICD11_TOKEN_URL || "https://icdaccessmanagement.who.int/connect/token",
  release: flag("--release", process.env.ICD11_RELEASE || "2024-01"),
  lang: flag("--lang", process.env.ICD11_LANG || "en"),
  delayMs: Number(process.env.ICD11_DELAY_MS || 60),
  limit: Number(flag("--limit", "0")) || 0,
  smoke: has("--smoke"),
  dryRun: has("--dry-run"),
};
// النسخ المحلية لا تتطلب OAuth-2 (حسب وثيقة ICDAPI-LocalDeployment)
const IS_LOCAL = !CFG.base.includes("id.who.int");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, opts, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    const r = await fetch(url, opts);
    if (r.status === 429 || r.status >= 500) {
      await sleep(800 * i);
      continue;
    }
    return r;
  }
  return null;
}

/** الحصول على رمز OAuth2 للسحابة؛ null للنشر المحلي */
async function getToken() {
  if (IS_LOCAL) return null;
  if (!CFG.clientId || !CFG.clientSecret)
    throw new Error(
      "Cloud ICD-API needs ICD11_CLIENT_ID + ICD11_CLIENT_SECRET (free: icd.who.int/icdapi) — or use a local deployment with ICD11_BASE_URL=http://localhost:PORT/icd",
    );
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "icdapi_access",
  });
  const r = await fetchWithRetry(CFG.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!r) throw new Error(`Token endpoint retries exhausted: ${CFG.tokenUrl}`);
  if (!r.ok) throw new Error(`Token endpoint ${CFG.tokenUrl} -> HTTP ${r.status}`);
  const j = await r.json();
  return j.access_token;
}

function entityUrl(id) {
  const frag = id.startsWith("http") ? id.split("/").pop() : id;
  return `${CFG.base}/release/11/${CFG.release}/mms/entity/${encodeURIComponent(frag)}`;
}

async function fetchEntity(id, token) {
  const headers = { "API-Version": CFG.apiVersion, "Accept-Language": CFG.lang };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetchWithRetry(entityUrl(id), { headers });
  if (!r) throw new Error(`exhausted retries: ${id}`);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${id}`);
  return r.json();
}

/** استخراج قيمة مسار من كائن JSON-LD */
const pick = (o, path) => path.reduce((a, k) => (a == null ? a : a[k]), o);
const norm = (v) => {
  if (Array.isArray(v)) v = v[0];
  if (v && typeof v === "object") return v["@value"] ?? undefined;
  return v;
};
const titleValue = (e, lang) =>
  norm(pick(e, ["title", lang, "@value"])) ?? norm(pick(e, ["title", lang])) ?? norm(pick(e, ["title"]));

async function main() {
  if (CFG.dryRun) {
    // Log only a strict allowlist of non-sensitive runtime settings.
    const dryRunInfo = {
      base: CFG.base,
      apiVersion: CFG.apiVersion,
      release: CFG.release,
      lang: CFG.lang,
      delayMs: CFG.delayMs,
      limit: CFG.limit,
      smoke: CFG.smoke,
      dryRun: CFG.dryRun,
      authMode: IS_LOCAL ? "none (local deployment)" : "OAuth2 client_credentials",
    };
    console.log("DRY_RUN config:", JSON.stringify(dryRunInfo, null, 1));
    console.log("FIELD_MAP: uri(@id), code, title_lang(prefLabel), definition, parent, child, browserUrl");
    console.log("DB table : icd11_codes (code,title_en,title_ar,chapter,version,is_starter,uri,parent_code)");
    console.log("AUTH     :", IS_LOCAL ? "none (local deployment)" : "OAuth2 client_credentials");
    return;
  }

  const db = await mysql.createConnection(CFG.dbUrl);

  // استئناف: تخطي URIs المخزنة سابقًا
  const [rows] = await db.query("SELECT uri FROM icd11_codes WHERE uri IS NOT NULL");
  const seen = new Set(rows.map((r) => r.uri));
  let inserted = 0;

  const queue = [];
  const pushKids = (e, parentCode) => {
    for (const c of e.child ?? []) {
      const uri = typeof c === "string" ? c : c?.["@id"];
      if (uri && !seen.has(uri)) {
        seen.add(uri);
        queue.push([uri, parentCode]);
      }
    }
  };

  const token = await getToken();
  const rootId = `${CFG.base}/release/11/${CFG.release}/mms`;
  const root = await fetchEntity(rootId, token);
  if (!root) throw new Error(`linearization root not found: ${rootId}`);
  pushKids(root, null);
  if (CFG.smoke) queue.splice(12);

  while (queue.length && (!CFG.limit || inserted < CFG.limit)) {
    const [id, parentCode] = queue.shift();
    const e = await fetchEntity(id, token).catch(() => null);
    if (!e) continue;
    const code = norm(pick(e, ["code"])) ?? id.split("/").pop();
    const uri = e["@id"] ?? id;
    await db.query(
      `INSERT INTO icd11_codes (code,title_en,title_ar,chapter,version,is_starter,uri,parent_code)
       VALUES (?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE title_en=VALUES(title_en), title_ar=VALUES(title_ar), uri=VALUES(uri)`,
      [
        code,
        titleValue(e, CFG.lang),
        titleValue(e, "ar") ?? titleValue(e, CFG.lang),
        "",
        `ICD-11 MMS ${CFG.release} (WHO ICD-API v${CFG.apiVersion})`,
        0,
        uri,
        parentCode,
      ],
    );
    inserted++;
    pushKids(e, code);
    await sleep(CFG.delayMs);
  }

  console.log(`INGEST_DONE inserted=${inserted} visited=${seen.size} mode=${CFG.smoke ? "smoke" : "full"}`);
  await db.end();
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error("ICD11_ERR", err.message || String(err));
    process.exit(1);
  },
);
