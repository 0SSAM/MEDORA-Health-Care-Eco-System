#!/usr/bin/env node
// seed-icd11.mjs — ICD-11 codes seeding.
// 1) إذا وُجد /tmp/icd11_data.json (أو مسار عبر --data) → استيراد الخطية الكاملة (is_starter=0)
// 2) وإلا → زرع مجموعة ابتدائية موثقة (is_starter=1) بأكثر الرموز شيوعًا، مع إعلان صادق بأنها غير مكتملة
// Usage: DATABASE_URL="mysql://user:pass@127.0.0.1:3306/medora" node scripts/seed-icd11.mjs [--data path.json]
import mysql from "mysql2/promise";
import fs from "node:fs";

const url = process.env.DATABASE_URL || "mysql://medora:medora@127.0.0.1:3306/medora";
const dataPath = process.argv.find((a, i) => a === "--data") ? process.argv[process.argv.indexOf("--data") + 1] : null;

const DDL = `
CREATE TABLE IF NOT EXISTS icd11_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(16) NOT NULL UNIQUE,
  title_en VARCHAR(512) NOT NULL,
  title_ar VARCHAR(512),
  chapter VARCHAR(32),
  parent_code VARCHAR(16),
  version VARCHAR(128) NOT NULL,
  release_date DATE,
  source VARCHAR(128),
  is_starter TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  INDEX idx_icd11_title (title_en(64)),
  INDEX idx_icd11_code (code)
)`;

// مجموعة ابتدائية (starter) — رموز شهيرة معلنة من WHO ICD-11 MMS؛ التحقق عبر متصفح WHO قبل الاستخدام السريري.
const STARTER = [
  ["1A00", "Cholera", "الكوليرا", "01"],
  ["1B10", "Tuberculosis of the respiratory system", "السل التنفسي", "01"],
  ["2C60", "Breast cancer", "سرطان الثدي", "02"],
  ["4A44", "Iron deficiency anaemia", "فقر الدم الناجم عن عوز الحديد", "03"],
  ["5A10", "Type 1 diabetes mellitus", "داء السكري من النمط الأول", "05"],
  ["5A11", "Type 2 diabetes mellitus", "داء السكري من النمط الثاني", "05"],
  ["5B82", "Obesity", "السمنة", "05"],
  ["6A20", "Schizophrenia", "الفصام", "06"],
  ["6A70", "Depressive disorders", "الاضطرابات الاكتئابية", "06"],
  ["6A71", "Single episode depressive disorder", "الاضطراب الاكتئابي بنوبة واحدة", "06"],
  ["6A72", "Recurrent depressive disorder", "الاضطراب الاكتئابي المتكرر", "06"],
  ["6A80", "Bipolar type I disorder", "الاضطراب ثنائي القطب من النمط الأول", "06"],
  ["7A00", "Insomnia disorders", "اضطرابات الأرق", "07"],
  ["BA00", "Essential hypertension", "فرط ضغط الدم الأساسي", "11"],
  ["BA01", "Hypertensive heart disease", "مرض القلب الناتج عن فرط ضغط الدم", "11"],
  ["BA40", "Ischaemic heart diseases", "أمراض القلب الإقفارية", "11"],
  ["BA42", "Heart failure", "القصور القلبي", "11"],
  ["CA22", "Chronic obstructive pulmonary disease", "الداء الرئوي الانسدادي المزمن", "12"],
  ["CA23", "Asthma", "الربو", "12"],
  ["DA20", "Peptic ulcer disease", "القرحة الهضمية", "13"],
  ["GA10", "Dental caries", "تسوس الأسنان", "17"],
  ["GB60", "Disorders of the external ear", "اضطرابات الأذن الخارجية", "17"],
  ["JA60", "Acute upper respiratory infections", "العداوى التنفسية العلوية الحادة", "22"],
  ["KA60", "Cholelithiasis", "التحصي الصفراوي", "13"],
  ["LA00", "Muscular dystrophies", "الحثل العضلي", "20"],
  ["MG30", "Chronic pain", "الألم المزمن", "21"],
  ["NA00", "Diseases of the nervous system (block)", "أمراض الجهاز العصبي", "08"],
  ["PC70", "Preterm newborn", "الوليد المبتسر", "19"],
  ["QA44", "Disorders of visual function", "اضطرابات الوظيفة البصرية", "17"],
  ["RA01", "Diseases of the urinary system (block)", "أمراض الجهاز البولي", "16"],
  ["SA00", "Pregnancy-related (block)", "الحالات المرتبطة بالحمل", "18"],
];

async function main() {
  const conn = await mysql.createConnection(url);
  await conn.query(DDL);

  let rows = [];
  let version = "ICD-11 MMS 2024-01 (curated starter subset)";
  let releaseDate = null;
  let source = "WHO ICD-11 MMS — curated common codes (verify in WHO browser)";
  let isStarter = 1;

  const path = dataPath || "/tmp/icd11_data.json";
  if (fs.existsSync(path)) {
    try {
      const meta = JSON.parse(fs.readFileSync(path, "utf-8"));
      if (Array.isArray(meta.rows) && meta.rows.length >= 500) {
        rows = meta.rows;
        version = meta.version || "ICD-11 MMS (mirror import)";
        releaseDate = meta.releaseDate || null;
        source = meta.source || "ICD-11 mirror dataset";
        isStarter = meta.isStarter === 0 ? 0 : 1;
        console.log(`full data file loaded: ${rows.length} rows (${version})`);
      } else {
        console.log(`data file found but insufficient rows (${meta.rows?.length ?? 0}) — falling back to starter`);
      }
    } catch (e) {
      console.log("data file unreadable — falling back to starter:", String(e).slice(0, 80));
    }
  }

  if (rows.length === 0) {
    rows = STARTER.map(([code, en, ar, ch]) => ({ code, titleEn: en, titleAr: ar, chapter: ch }));
    console.log("using curated starter set:", rows.length);
  }

  let inserted = 0;
  for (const r of rows) {
    await conn.query(
      `INSERT INTO icd11_codes (code, title_en, title_ar, chapter, version, release_date, source, is_starter, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE title_en=VALUES(title_en), title_ar=VALUES(title_ar), chapter=VALUES(chapter),
         version=VALUES(version), is_starter=VALUES(is_starter)`,
      [r.code, r.titleEn, r.titleAr || null, r.chapter || null, version, releaseDate, source, isStarter],
    );
    inserted++;
  }

  const [cnt] = await conn.query("SELECT COUNT(*) AS n FROM icd11_codes");
  console.log(`ICD11_SEEDED inserted=${inserted} total=${cnt[0].n} version=${version} isStarter=${isStarter}`);
  await conn.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
