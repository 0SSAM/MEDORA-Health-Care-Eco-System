#!/usr/bin/env node
// GP MAX — seed layers L0–L7 + checkpoint library (96 checkpoints: 12 per layer).
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
  // L0 Foundation (12)
  ["L0", "GP-L0-01", "وضوح الهوية والرسالة", "Brand & message clarity", "brand", 2, "رسالة واضحة وجمهور محدد"],
  ["L0", "GP-L0-02", "اكتمال الملف التعريفي للنشاط", "Complete business profile", "brand", 2, "الاسم والشعار والوصف كاملة"],
  ["L0", "GP-L0-03", "البنية التقنية الأساسية", "Core tech setup", "tech", 1, "موقع/صفحة تعمل وأدوات قياس"],
  ["L0", "GP-L0-04", "تحديد أدوار الفريق", "Team roles defined", "team", 1, "مسؤول لكل قناة نمو"],
  ["L0", "GP-L0-05", "تحديد الجمهور المستهدف", "Target audience defined", "brand", 2, "شرائح محددة بخصائص واضحة"],
  ["L0", "GP-L0-06", "نقاط القوة والتميز", "Unique selling points", "brand", 1, "3+ ميزة تنافسية موثقة"],
  ["L0", "GP-L0-07", "أهداف نمو قابلة للقياس", "Measurable growth goals", "planning", 2, "أهداف ربع سنوية بأرقام"],
  ["L0", "GP-L0-08", "ميزانية تسويقية أولية", "Initial marketing budget", "finance", 2, "بند ميزانية للنمو"],
  ["L0", "GP-L0-09", "أدوات إدارة العملاء الأساسية", "Basic customer tools (CRM)", "tech", 1, "سجل عملاء مركزي"],
  ["L0", "GP-L0-10", "سياسة الاستجابة للعملاء", "Customer response policy", "service", 1, "زمن استجابة محدد"],
  ["L0", "GP-L0-11", "مصادقة قانونية وتراخيص النشاط", "Legal & licensing", "compliance", 2, "تراخيص سارية"],
  ["L0", "GP-L0-12", "لوحة قيادة أولية", "Starter dashboard", "data", 1, "مؤشرات أساسية مطبوعة"],
  // L1 Visibility (12)
  ["L1", "GP-L1-01", "التواجد على خرائط جوجل", "Google Maps presence", "local", 2, "بطاقة نشاط مؤكدة"],
  ["L1", "GP-L1-02", "اكتمال الحسابات الاجتماعية", "Complete social profiles", "social", 1, "3+ منصات نشطة"],
  ["L1", "GP-L1-03", "سيو محلي", "Local SEO", "seo", 2, "كلمات مفتاحية محلية في الصفحات"],
  ["L1", "GP-L1-04", "التقييمات الأولى", "First reviews", "reputation", 2, "10+ تقييم"],
  ["L1", "GP-L1-05", "توحيد الاسم والعنوان عبر المنصات", "Consistent NAP", "brand", 1, "اسم/عنوان/هاتف موحد"],
  ["L1", "GP-L1-06", "صفحة تعريفية احترافية", "About page", "web", 1, "صفحة من نحن كاملة"],
  ["L1", "GP-L1-07", "قنوات اتصال واضحة", "Clear contact channels", "service", 1, "هاتف/واتساب/بريد ظاهرة"],
  ["L1", "GP-L1-08", "منشورات جوجل للأعمال", "Google Business posts", "local", 1, "منشور أسبوعي"],
  ["L1", "GP-L1-09", "دليل النشاط على الخرائط", "Map listings", "local", 2, "مدخل في 2+ دليل"],
  ["L1", "GP-L1-10", "صور وفيديو احترافية للمنشأة", "Professional photos", "brand", 1, "10+ صورة وفيديو"],
  ["L1", "GP-L1-11", "سرعة استجابة الاستفسارات", "Fast inquiry response", "service", 2, "رد خلال ساعة"],
  ["L1", "GP-L1-12", "مراقبة السمعة الأسبوعية", "Weekly reputation watch", "reputation", 1, "جدول مراجعة تقييمات"],
  // L2 Attraction (12)
  ["L2", "GP-L2-01", "محرك محتوى منتظم", "Regular content engine", "content", 2, "4+ منشور/أسبوع"],
  ["L2", "GP-L2-02", "مغناطيس عملاء", "Lead magnets", "content", 1, "هدية/عرض مقابل بيانات تواصل"],
  ["L2", "GP-L2-03", "أساسيات الإعلان", "Ads basics", "ads", 2, "حملة تجريبية بميزانية صغيرة"],
  ["L2", "GP-L2-04", "استهداف الجمهور", "Audience targeting", "ads", 2, "شرائح محددة"],
  ["L2", "GP-L2-05", "تقويم محتوى شهري", "Monthly content calendar", "content", 1, "جدول محتوى موثق"],
  ["L2", "GP-L2-06", "محتوى تفاعلي", "Interactive content", "content", 1, "استفتاء/سؤال/مسابقة"],
  ["L2", "GP-L2-07", "قصص نجاح العملاء", "Customer success stories", "social", 2, "3+ قصة منشورة"],
  ["L2", "GP-L2-08", "مقاطع فيديو قصيرة", "Short videos", "content", 2, "فيديو أسبوعي"],
  ["L2", "GP-L2-09", "هاشتاقات محلية", "Local hashtags", "social", 1, "قائمة هاشتاقات معتمدة"],
  ["L2", "GP-L2-10", "الترويج المتبادل", "Cross-promotion", "growth", 1, "شراكة محتوى واحدة"],
  ["L2", "GP-L2-11", "مسابقات وعروض", "Contests & offers", "engagement", 1, "عرض شهري"],
  ["L2", "GP-L2-12", "تحليل أداء المحتوى", "Content performance review", "data", 1, "تقرير تفاعل شهري"],
  // L3 Conversion (12)
  ["L3", "GP-L3-01", "صفحات هبوط", "Landing pages", "conversion", 2, "صفحة لكل عرض رئيسي"],
  ["L3", "GP-L3-02", "دعوات واضحة", "Clear CTAs", "conversion", 1, "زر/رسالة في كل صفحة"],
  ["L3", "GP-L3-03", "أتمتة الواتساب/الرد", "WhatsApp automation", "automation", 2, "رد آلي فوري"],
  ["L3", "GP-L3-04", "جمع التقييمات", "Review collection", "reputation", 1, "طلب تقييم بعد كل خدمة"],
  ["L3", "GP-L3-05", "نموذج حجز/استفسار سريع", "Quick booking form", "conversion", 2, "نموذج بأقل من 4 حقول"],
  ["L3", "GP-L3-06", "مدة استجابة أقل من ساعة", "Sub-hour response", "service", 2, "تنبيه للرد السريع"],
  ["L3", "GP-L3-07", "شهادات وتوصيات معروضة", "Testimonials shown", "conversion", 1, "3+ شهادة على الموقع"],
  ["L3", "GP-L3-08", "تكامل الدفع الإلكتروني", "Online payment", "tech", 1, "محفظة/بطاقة مفعلة"],
  ["L3", "GP-L3-09", "متابعة ما بعد الخدمة", "Post-service follow-up", "retention", 1, "رسالة شكر/متابعة"],
  ["L3", "GP-L3-10", "صفحات الأسئلة الشائعة", "FAQ pages", "conversion", 1, "10+ سؤال مجاب"],
  ["L3", "GP-L3-11", "تحليل مصادر الزوار", "Source analytics", "data", 1, "تتبع المصادر"],
  ["L3", "GP-L3-12", "عروض ترحيبية للعملاء الجدد", "Welcome offers", "offers", 2, "عرض أول زيارة"],
  // L4 Revenue (12)
  ["L4", "GP-L4-01", "تشكيلة عروض واضحة", "Clear offers", "offers", 2, "3+ عرض محدد"],
  ["L4", "GP-L4-02", "تسعير مدروس", "Pricing strategy", "offers", 2, "تسعير مقارن بالسوق"],
  ["L4", "GP-L4-03", "البيع الإضافي", "Upsell", "revenue", 1, "عروض إضافية للعملاء الحاليين"],
  ["L4", "GP-L4-04", "برنامج ولاء/احتفاظ", "Retention program", "revenue", 1, "عودة العميل خلال 90 يومًا"],
  ["L4", "GP-L4-05", "حزم خدمات", "Service bundles", "offers", 2, "حزمتان جاهزتان"],
  ["L4", "GP-L4-06", "عروض موسمية", "Seasonal offers", "offers", 1, "عرض موسمي مخطط"],
  ["L4", "GP-L4-07", "متوسط قيمة الطلب متتبع", "Average order tracking", "data", 2, "مؤشر AOV شهري"],
  ["L4", "GP-L4-08", "برنامج إحالات", "Referral program", "growth", 2, "مكافأة إحالة"],
  ["L4", "GP-L4-09", "تجزئة العملاء", "Customer segmentation", "crm", 1, "3+ شريحة سلوكية"],
  ["L4", "GP-L4-10", "تقليل تكلفة الاكتساب", "CAC reduction", "finance", 2, "اتجاه CAC متناقص"],
  ["L4", "GP-L4-11", "رفع معدل التكرار", "Repeat rate growth", "retention", 2, "زيادة الزيارات المتكررة"],
  ["L4", "GP-L4-12", "تقرير إيرادات شهري", "Monthly revenue report", "finance", 1, "تقرير موثق"],
  // L5 Scaling (12)
  ["L5", "GP-L5-01", "حملات مدفوعة متوسطة", "Scaled paid campaigns", "ads", 2, "ميزانية منتظمة بنتائج"],
  ["L5", "GP-L5-02", "شراكات", "Partnerships", "growth", 1, "شراكتان فعالتان"],
  ["L5", "GP-L5-03", "برنامج إحالات", "Referral program", "growth", 2, "قناة إحالات نشطة"],
  ["L5", "GP-L5-04", "توسع جغرافي/قنوات", "Channel expansion", "growth", 1, "قناة جديدة"],
  ["L5", "GP-L5-05", "أتمتة تسويقية", "Marketing automation", "automation", 2, "سير عمل آلي واحد"],
  ["L5", "GP-L5-06", "فريق نمو مخصص", "Dedicated growth team", "team", 1, "مسؤول نمو بدوام"],
  ["L5", "GP-L5-07", "ميزانية توسع واضحة", "Clear expansion budget", "finance", 2, "بند توسع ربع سنوي"],
  ["L5", "GP-L5-08", "حملات إعادة الاستهداف", "Retargeting campaigns", "ads", 2, "بكسل وشرائح إعادة استهداف"],
  ["L5", "GP-L5-09", "محتوى قيادي فكري", "Thought leadership", "content", 1, "مقال/فيديو شهري"],
  ["L5", "GP-L5-10", "فروع/منافذ جديدة", "New branches", "growth", 2, "خطة فتح موثقة"],
  ["L5", "GP-L5-11", "شراكة مؤثرين", "Influencer partnerships", "growth", 1, "تعاون واحد"],
  ["L5", "GP-L5-12", "مؤشرات توسع أسبوعية", "Weekly scaling KPIs", "data", 1, "لوحة مؤشرات"],
  // L6 Optimization (12)
  ["L6", "GP-L6-01", "لوحة تحليلات", "Analytics dashboard", "data", 2, "مؤشرات مبيعات وحركة"],
  ["L6", "GP-L6-02", "تتبع التحويل", "Conversion tracking", "data", 2, "أحداث محورية"],
  ["L6", "GP-L6-03", "اختبارات A/B", "A/B testing", "optimization", 1, "اختبار شهري"],
  ["L6", "GP-L6-04", "مؤشرات الأداء", "KPI review", "data", 1, "مراجعة شهرية"],
  ["L6", "GP-L6-05", "تحليل مسار العميل", "Funnel analysis", "data", 2, "مسار من 4+ خطوات"],
  ["L6", "GP-L6-06", "تحسين صفحة الهبوط", "Landing page CRO", "optimization", 2, "تحسين معدل تحويل"],
  ["L6", "GP-L6-07", "استطلاع رضا العملاء", "Customer satisfaction survey", "service", 1, "استطلاع ربع سنوي"],
  ["L6", "GP-L6-08", "مراجعة تكلفة الاكتساب", "CAC review", "finance", 1, "مقارنة شهرية"],
  ["L6", "GP-L6-09", "تحسين تكرار الطلبات", "Repeat order optimization", "retention", 2, "حملة إعادة تفعيل"],
  ["L6", "GP-L6-10", "تجارب تسعير", "Pricing experiments", "offers", 1, "تجربة تسعير موثقة"],
  ["L6", "GP-L6-11", "مراجعة محتوى شهرية", "Monthly content review", "content", 1, "تقرير أداء محتوى"],
  ["L6", "GP-L6-12", "تحسين السرعة التقنية", "Site speed optimization", "tech", 1, "زمن تحميل < 3s"],
  // L7 Growth Ops (12)
  ["L7", "GP-L7-01", "إجراءات موثقة (SOP)", "Documented SOPs", "ops", 1, "توثيق لكل قناة"],
  ["L7", "GP-L7-02", "لوحة قيادة تنفيذية", "Executive dashboard", "ops", 2, "لوحة أداء أسبوعية"],
  ["L7", "GP-L7-03", "خطة 30 يومًا", "30-day growth plan", "planning", 2, "خطة شهرية بالأهداف"],
  ["L7", "GP-L7-04", "مراجعة شهرية للنمو", "Monthly growth review", "planning", 1, "اجتماع مراجعة مع توصيات"],
  ["L7", "GP-L7-05", "اجتماع أسبوعي للنمو", "Weekly growth meeting", "ops", 1, "موعد ثابت"],
  ["L7", "GP-L7-06", "مسؤول نمو لكل قناة", "Channel owners", "team", 2, "مهمة موثقة لكل قناة"],
  ["L7", "GP-L7-07", "توثيق التجارب", "Experiment log", "ops", 1, "سجل تجارب محدث"],
  ["L7", "GP-L7-08", "نموذج تنبؤ بالإيراد", "Revenue forecast model", "finance", 2, "تنبؤ ربع سنوي"],
  ["L7", "GP-L7-09", "دليل تشغيل الإعلانات", "Ads playbook", "ads", 1, "توثيق الإعدادات والنتائج"],
  ["L7", "GP-L7-10", "أرشفة التعلم", "Knowledge base", "ops", 1, "مستودع دروس مستفادة"],
  ["L7", "GP-L7-11", "تقييم ربع سنوي", "Quarterly review", "planning", 2, "تقرير ربع سنوي"],
  ["L7", "GP-L7-12", "تحديث خطة النمو السنوية", "Annual growth plan update", "planning", 1, "خطة سنوية محدثة"],  // L0 extensions (13-18)
  ["L0", "GP-L0-13", "نموذج عمل موثق", "Documented business model", "planning", 2, "مصدر أرباح وتكاليف موثق"],
  ["L0", "GP-L0-14", "سياسة الخصوصية والبيانات", "Privacy & data policy", "compliance", 2, "سياسة منشورة ومطبقة"],
  ["L0", "GP-L0-15", "خطة محتوى أولية", "Starter content plan", "content", 1, "اتجاه محتوى موثق"],
  ["L0", "GP-L0-16", "قنوات التواصل الداخلية", "Internal comms channels", "team", 1, "أداة تواصل موحدة"],
  ["L0", "GP-L0-17", "صندوق طوارئ تشغيلي", "Operational buffer", "finance", 1, "سيولة احتياطية محددة"],
  ["L0", "GP-L0-18", "معايير الجودة الدنيا", "Minimum quality standards", "service", 2, "قائمة معايير مكتوبة"],
  // L1 extensions (13-18)
  ["L1", "GP-L1-13", "قوائم الأدلة المتخصصة", "Niche directory listings", "local", 1, "مدخل في دليل قطاعي"],
  ["L1", "GP-L1-14", "صورة الغلاف موحدة", "Consistent cover visuals", "brand", 1, "هوية بصرية موحدة"],
  ["L1", "GP-L1-15", "رصد الإشارات للعلامة", "Brand mentions monitoring", "reputation", 1, "تنبيه شهري للإشارات"],
  ["L1", "GP-L1-16", "أسئلة وأجوبة خرائط جوجل", "Google Maps Q&A", "local", 1, "10+ سؤال مجاب"],
  ["L1", "GP-L1-17", "تحسين سرعة الموقع", "Site speed optimization", "web", 2, "زمن تحميل أقل من 3 ثوان"],
  ["L1", "GP-L1-18", "صفحة خدمات وتسعير واضحة", "Clear services & pricing page", "web", 2, "صفحة محدثة"],
  // L2 extensions (13-18)
  ["L2", "GP-L2-13", "إعلانات محلية مستهدفة", "Local targeted ads", "ads", 2, "حملة جيوجرافية"],
  ["L2", "GP-L2-14", "مقالات تعليمية", "Educational articles", "content", 2, "مقالان شهريًا"],
  ["L2", "GP-L2-15", "تعاون مؤثرين محليين", "Local influencer collaboration", "growth", 2, "شراكة واحدة منفذة"],
  ["L2", "GP-L2-16", "نشرة بريدية دورية", "Email/SMS newsletter", "retention", 1, "نشرة شهرية"],
  ["L2", "GP-L2-17", "بكسل إعادة الاستهداف", "Retargeting pixel", "ads", 1, "بكسل مفعل"],
  ["L2", "GP-L2-18", "تحليل منافسين شهري", "Monthly competitor scan", "data", 1, "تقرير مقارنة"],
  // L3 extensions (13-18)
  ["L3", "GP-L3-13", "عرض ترحيبي للعملاء الجدد", "Welcome offer", "conversion", 2, "عرض قائم"],
  ["L3", "GP-L3-14", "رسائل متابعة آلية", "Automated follow-up sequences", "automation", 2, "سلسلة 3 رسائل"],
  ["L3", "GP-L3-15", "صفحة شكر وإحالة", "Thank-you & referral page", "referral", 1, "صفحة مفعلة"],
  ["L3", "GP-L3-16", "دعم محادثة مباشرة", "Live chat support", "service", 1, "دردشة متاحة"],
  ["L3", "GP-L3-17", "اختبار عرضين متنافسين", "A/B test two offers", "conversion", 1, "نتيجة موثقة"],
  ["L3", "GP-L3-18", "سياسة استرجاع واضحة", "Clear refund/guarantee policy", "service", 2, "سياسة منشورة"],
  // L4 extensions (13-18)
  ["L4", "GP-L4-13", "برنامج ولاء عملاء", "Customer loyalty program", "retention", 2, "برنامج قائم"],
  ["L4", "GP-L4-14", "عروض موسمية مجدولة", "Seasonal offers calendar", "revenue", 2, "تقويم موسمي"],
  ["L4", "GP-L4-15", "دليل البيع المتقاطع", "Cross-selling playbook", "revenue", 1, "سيناريوهات موثقة"],
  ["L4", "GP-L4-16", "حساب تكلفة اكتساب العميل", "CAC estimation", "finance", 2, "رقم CAC شهري"],
  ["L4", "GP-L4-17", "خطة احتفاظ شهرية", "Monthly retention plan", "retention", 1, "خطة موثقة"],
  ["L4", "GP-L4-18", "استهداف متوسط قيمة الطلب", "AOV target", "revenue", 1, "هدف AOV محدد"],
  // L5 extensions (13-18)
  ["L5", "GP-L5-13", "شراكات القطاع", "Industry partnerships", "growth", 2, "شراكة رسمية"],
  ["L5", "GP-L5-14", "برنامج إحالة رسمي", "Official referral program", "referral", 2, "برنامج بحوافز"],
  ["L5", "GP-L5-15", "توسع جغرافي متدرج", "Phased geographic expansion", "growth", 1, "خطة توسع"],
  ["L5", "GP-L5-16", "توثيق عمليات التسويق", "Marketing ops documentation", "ops", 1, "دليل عمليات"],
  ["L5", "GP-L5-17", "ميزانية نمو ربع سنوية", "Quarterly growth budget", "finance", 2, "ميزانية معتمدة"],
  ["L5", "GP-L5-18", "فريق نمو متخصص", "Dedicated growth team", "team", 2, "أدوار محددة"],
  // L6 extensions (13-18)
  ["L6", "GP-L6-13", "لوحة مؤشرات شهرية", "Monthly KPI dashboard", "data", 2, "لوحة محدثة"],
  ["L6", "GP-L6-14", "اختبارات A/B مستمرة", "Continuous A/B testing", "optimization", 2, "اختبار شهري"],
  ["L6", "GP-L6-15", "خريطة رحلة العميل", "Customer journey map", "data", 1, "خريطة موثقة"],
  ["L6", "GP-L6-16", "مراجعة القمع التحويلي", "Funnel review", "analytics", 2, "تقرير قمع شهري"],
  ["L6", "GP-L6-17", "أتمتة التقارير", "Automated reporting", "automation", 1, "تقرير تلقائي"],
  ["L6", "GP-L6-18", "معايير أداء الفريق", "Team performance metrics", "team", 1, "مؤشرات فردية"],
  // L7 extensions (13-18)
  ["L7", "GP-L7-13", "دليل تشغيل النمو", "Growth SOPs", "ops", 2, "SOP موثقة"],
  ["L7", "GP-L7-14", "اجتماع مراجعة أسبوعي", "Weekly growth review", "ops", 1, "اجتماع مثبت بالجدول"],
  ["L7", "GP-L7-15", "خطة 90 يومًا متجددة", "Rolling 90-day plan", "planning", 2, "خطة محدثة"],
  ["L7", "GP-L7-16", "رصد NPS/CSAT شهري", "Monthly NPS/CSAT", "data", 1, "استطلاع شهري"],
  ["L7", "GP-L7-17", "سجل تجارب وأفكار", "Experiments backlog", "optimization", 1, "سجل حي"],
  ["L7", "GP-L7-18", "مراجعة ربع سنوية شاملة", "Quarterly deep review", "planning", 2, "تقرير ربع سنوي"],

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
    await conn.query(
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
