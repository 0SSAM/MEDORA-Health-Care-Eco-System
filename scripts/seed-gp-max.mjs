#!/usr/bin/env node
// GP MAX — seed layers L0–L7 + starter checkpoints (scaffold).
// Usage: DATABASE_URL="mysql://user:pass@127.0.0.1:3306/medora" node scripts/seed-gp-max.mjs
import mysql from "mysql2/promise";

const url =
  process.env.DATABASE_URL || "mysql://medora:medora@127.0.0.1:3306/medora";

const LAYERS = [
  ["L0", "الأساس", "Foundation", 0, "الهوية، وضوح العرض، البيئة التقنية، أدوار الفريق"],
  ["L1", "الظهور", "Visibility", 1, "التواجد، الملفات، السيو المحلي"],
  ["L2", "الجذب", "Attraction", 2, "محرك المحتوى، مغناطيس العملاء، أساسيات الإعلان"],
  ["L3", "التحويل", "Conversion", 3, "صفحات الهبوط، الدعوات، أتمتة الواتساب، التقييمات"],
  ["L4", "الإيرادات", "Revenue", 4, "العروض، التسعير، البيع الإضافي، الاحتفاظ"],
  ["L5", "التوسع", "Scaling", 5, "الاكتساب المدفوع، الشراكات، الإحالات"],
  ["L6", "التحسين", "Optimization", 6, "التحليلات، اختبارات A/B، مؤشرات الأداء"],
  ["L7", "تشغيل النمو", "Growth Ops", 7, "إجراءات موثقة، لوحات قيادة، خطط 30 يومًا"],
];

const CHECKPOINTS = [
  // L0 Foundation
  ["L0", "GP-L0-01", "وضوح الهوية والرسالة", "Brand & message clarity", "brand", 2, "رسالة واضحة وجمهور محدد"],
  ["L0", "GP-L0-02", "اكتمال الملف التعريفي للنشاط", "Complete business profile", "brand", 2, "الاسم والشعار والوصف كاملة"],
  ["L0", "GP-L0-03", "البنية التقنية الأساسية", "Core tech setup", "tech", 1, "موقع/صفحة تعمل وأدوات قياس"],
  ["L0", "GP-L0-04", "تحديد أدوار الفريق", "Team roles defined", "team", 1, "مسؤول لكل قناة نمو"],
  // L1 Visibility
  ["L1", "GP-L1-01", "التواجد على خرائط جوجل", "Google Maps presence", "local", 2, "بطاقة نشاط مؤكدة"],
  ["L1", "GP-L1-02", "اكتمال الحسابات الاجتماعية", "Complete social profiles", "social", 1, "3+ منصات نشطة"],
  ["L1", "GP-L1-03", "سيو محلي", "Local SEO", "seo", 2, "كلمات مفتاحية محلية في الصفحات"],
  ["L1", "GP-L1-04", "التقييمات الأولى", "First reviews", "reputation", 2, "10+ تقييم"],
  // L2 Attraction
  ["L2", "GP-L2-01", "محرك محتوى منتظم", "Regular content engine", "content", 2, "4+ منشور/أسبوع"],
  ["L2", "GP-L2-02", "مغناطيس عملاء", "Lead magnets", "content", 1, "هدية/عرض مقابل بيانات تواصل"],
  ["L2", "GP-L2-03", "أساسيات الإعلان", "Ads basics", "ads", 2, "حملة تجريبية بميزانية صغيرة"],
  ["L2", "GP-L2-04", "استهداف الجمهور", "Audience targeting", "ads", 2, "شرائح محددة"],
  // L3 Conversion
  ["L3", "GP-L3-01", "صفحات هبوط", "Landing pages", "conversion", 2, "صفحة لكل عرض رئيسي"],
  ["L3", "GP-L3-02", "دعوات واضحة", "Clear CTAs", "conversion", 1, "زر/رسالة في كل صفحة"],
  ["L3", "GP-L3-03", "أتمتة الواتساب/الرد", "WhatsApp automation", "automation", 2, "رد آلي فوري"],
  ["L3", "GP-L3-04", "جمع التقييمات", "Review collection", "reputation", 1, "طلب تقييم بعد كل خدمة"],
  // L4 Revenue
  ["L4", "GP-L4-01", "تشكيلة عروض واضحة", "Clear offers", "offers", 2, "3+ عرض محدد"],
  ["L4", "GP-L4-02", "تسعير مدروس", "Pricing strategy", "offers", 2, "تسعير مقارن بالسوق"],
  ["L4", "GP-L4-03", "البيع الإضافي", "Upsell", "revenue", 1, "عروض إضافية للعملاء الحاليين"],
  ["L4", "GP-L4-04", "برنامج ولاء/احتفاظ", "Retention program", "revenue", 1, "عودة العميل خلال 90 يومًا"],
  // L5 Scaling
  ["L5", "GP-L5-01", "حملات مدفوعة متوسطة", "Scaled paid campaigns", "ads", 2, "ميزانية منتظمة بنتائج"],
  ["L5", "GP-L5-02", "شراكات", "Partnerships", "growth", 1, "شراكتان فعالتان"],
  ["L5", "GP-L5-03", "برنامج إحالات", "Referral program", "growth", 2, "مكافأة إحالة"],
  ["L5", "GP-L5-04", "توسع جغرافي/قنوات", "Channel expansion", "growth", 1, "قناة جديدة"],
  // L6 Optimization
  ["L6", "GP-L6-01", "لوحة تحليلات", "Analytics dashboard", "data", 2, "مؤشرات مبيعات وحركة"],
  ["L6", "GP-L6-02", "تتبع التحويل", "Conversion tracking", "data", 2, "أحداث محورية"],
  ["L6", "GP-L6-03", "اختبارات A/B", "A/B testing", "optimization", 1, "اختبار شهري"],
  ["L6", "GP-L6-04", "مؤشرات الأداء", "KPI review", "data", 1, "مراجعة شهرية"],
  // L7 Growth Ops
  ["L7", "GP-L7-01", "إجراءات موثقة (SOP)", "Documented SOPs", "ops", 1, "توثيق لكل قناة"],
  ["L7", "GP-L7-02", "لوحة قيادة تنفيذية", "Executive dashboard", "ops", 2, "لوحة أداء أسبوعية"],
  ["L7", "GP-L7-03", "خطة 30 يومًا", "30-day growth plan", "planning", 2, "خطة شهرية بالأهداف"],
  ["L7", "GP-L7-04", "مراجعة شهرية للنمو", "Monthly growth review", "planning", 1, "اجتماع مراجعة مع توصيات"],
];

async function main() {
  const conn = await mysql.createConnection(url);
  console.log("connected");

  const ddl = [
    "CREATE TABLE IF NOT EXISTS gp_max_layers (id INT AUTO_INCREMENT PRIMARY KEY, layerCode VARCHAR(8) NOT NULL UNIQUE, layerNameAr VARCHAR(255) NOT NULL, layerNameEn VARCHAR(255) NOT NULL, description TEXT, sortOrder INT NOT NULL DEFAULT 0)",
    "CREATE TABLE IF NOT EXISTS gp_max_checkpoints (id INT AUTO_INCREMENT PRIMARY KEY, layerId INT NOT NULL, code VARCHAR(32) NOT NULL UNIQUE, titleAr VARCHAR(255) NOT NULL, titleEn VARCHAR(255) NOT NULL, category VARCHAR(64), weight INT NOT NULL DEFAULT 1, passingCriteria TEXT, active TINYINT NOT NULL DEFAULT 1, INDEX gp_max_ckpt_layer_idx (layerId))",
    "CREATE TABLE IF NOT EXISTS gp_max_assessments (id INT AUTO_INCREMENT PRIMARY KEY, organizationId INT NOT NULL, layerCode VARCHAR(8), status VARCHAR(16) NOT NULL DEFAULT 'draft', score INT, summary TEXT, createdAt DATETIME NOT NULL, completedAt DATETIME, INDEX gp_max_assmt_org_idx (organizationId))",
    "CREATE TABLE IF NOT EXISTS gp_max_recommendations (id INT AUTO_INCREMENT PRIMARY KEY, assessmentId INT NOT NULL, checkpointId INT, priority VARCHAR(4) NOT NULL DEFAULT 'P2', recommendationAr TEXT, recommendationEn TEXT, resolved TINYINT NOT NULL DEFAULT 0, INDEX gp_max_rec_assmt_idx (assessmentId))",
  ];
  for (const q of ddl) {
    await conn.query(q);
  }

  const layerIds = {};
  for (const [code, ar, en, order, desc] of LAYERS) {
    const [r] = await conn.query(
      "INSERT INTO gp_max_layers (layerCode, layerNameAr, layerNameEn, description, sortOrder) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE layerNameAr=VALUES(layerNameAr), layerNameEn=VALUES(layerNameEn)",
      [code, ar, en, desc, order],
    );
    const [rows] = await conn.query(
      "SELECT id FROM gp_max_layers WHERE layerCode = ?",
      [code],
    );
    layerIds[code] = rows[0].id;
  }

  for (const [layer, ck, ar, en, cat, w, crit] of CHECKPOINTS) {
    await conn.query(
      "INSERT INTO gp_max_checkpoints (layerId, code, titleAr, titleEn, category, weight, passingCriteria) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE titleAr=VALUES(titleAr)",
      [layerIds[layer], ck, ar, en, cat, w, crit],
    );
  }

  console.log(
    `GP MAX seeded: ${LAYERS.length} layers, ${CHECKPOINTS.length} checkpoints`,
  );
  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
