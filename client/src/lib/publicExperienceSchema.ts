import {
  Activity,
  BrainCircuit,
  Building2,
  CheckCircle2,
  CircleGauge,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
  Stethoscope,
  Truck,
  WalletCards,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type ExperienceLocale = "en" | "ar";

type HeroMetric = { label: string; value: string; tone: string };
type FeatureCard = { icon: LucideIcon; title: string; body: string };
type NarrativeStep = { id: string; title: string; body: string };

type ExperienceCopy = {
  brandTitle: string;
  brandSubtitle: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  secureAccess: string;
  login: string;
  workspace: string;
  adminBootstrap: string;
  floatingPanelTitle: string;
  floatingPanelBody: string;
  heroMetrics: HeroMetric[];
  commandDeckTitle: string;
  commandDeckBody: string;
  commandDeckPoints: string[];
  platformKicker: string;
  platformTitle: string;
  platformBody: string;
  features: FeatureCard[];
  modelKicker: string;
  modelTitle: string;
  modelBody: string;
  modelSteps: NarrativeStep[];
  governanceKicker: string;
  governanceTitle: string;
  governanceBody: string;
  governanceBullets: string[];
  ctaTitle: string;
  ctaBody: string;
  footer: string;
};

export const publicExperienceSchema: Record<ExperienceLocale, ExperienceCopy> = {
  en: {
    brandTitle: "MEDORA | Health Care Eco System",
    brandSubtitle: "Clinical clarity, commercial control, and governed intelligence",
    eyebrow: "MEDORA | NEXT-GENERATION HEALTHCARE OPERATING SYSTEM",
    title: "One secure operating space for the healthcare journey.",
    subtitle: "MEDORA now presents itself as one coordinated command surface for pharmacy, care operations, finance, delivery, governance, and AI-assisted decision support—calm for operators, explicit for auditors, and bilingual by design.",
    secureAccess: "Secure access",
    login: "Sign in securely",
    workspace: "Enter your workspace",
    adminBootstrap: "Bootstrap admin: admin / admin",
    floatingPanelTitle: "Magnetic operating surface",
    floatingPanelBody: "A public landing experience that explains the product honestly, preserves governance language, and funnels the operator into the protected workspace without pretending that gated integrations are already live.",
    heroMetrics: [
      { label: "Protected modules", value: "24+", tone: "from-cyan-400 to-sky-500" },
      { label: "Languages", value: "AR + EN", tone: "from-emerald-400 to-teal-500" },
      { label: "Control model", value: "Fail-closed", tone: "from-violet-400 to-fuchsia-500" },
    ],
    commandDeckTitle: "Mission-control framing",
    commandDeckBody: "The public narrative now mirrors the actual repository structure: operations, care, finance, delivery, identity, governance, and integration readiness.",
    commandDeckPoints: [
      "Branch, organization, and jurisdiction stay visible as part of the security boundary.",
      "Human review remains mandatory for sensitive financial, clinical, and regulated flows.",
      "External connectivity is described as integration-gated until acceptance evidence exists.",
    ],
    platformKicker: "THE OPERATING SURFACE",
    platformTitle: "Every domain now reads like part of one ecosystem, not a loose set of screens.",
    platformBody: "The redesign unifies the product story across interface, content schema, and public website copy so MEDORA feels like a single healthcare operating system instead of a collection of modules.",
    features: [
      { icon: Workflow, title: "Operations command", body: "Daily workflows, branch-aware actions, and governed progress states are presented as one coordinated operational layer." },
      { icon: HeartPulse, title: "Care-safe boundaries", body: "Clinical and prescription pathways remain explicit about their guarded scope and their fail-closed constraints." },
      { icon: WalletCards, title: "Financial control", body: "Finance, POS, supplier balance, and accountability surfaces are framed as disciplined business control—not vague dashboards." },
      { icon: Truck, title: "Delivery orchestration", body: "Logistics, dispatch, and branch execution are surfaced as healthcare fulfillment infrastructure." },
      { icon: BrainCircuit, title: "Advisory intelligence", body: "AI stays assistive and bilingual, clarifying work without claiming authority it does not have." },
      { icon: Building2, title: "Institutional readiness", body: "MEDORA speaks to clinics, pharmacies, hospitals, insurers, and multi-branch operators with one consistent narrative." },
    ],
    modelKicker: "EXPERIENCE SCHEMA",
    modelTitle: "The page is now driven by a reusable content schema instead of a single hard-coded narrative block.",
    modelBody: "The public experience schema centralizes hero messaging, metrics, domain cards, governance language, and CTA structure so MEDORA’s story can evolve cleanly across pages and deployments.",
    modelSteps: [
      { id: "01", title: "Narrative schema first", body: "Brand story, metrics, and modules now come from a dedicated public schema file for consistency." },
      { id: "02", title: "Visual hierarchy second", body: "The interface emphasizes rhythm, contrast, and card sequencing while preserving bilingual usability." },
      { id: "03", title: "Governance always visible", body: "Security, review, and integration boundaries stay embedded in the page instead of being hidden in footnotes." },
    ],
    governanceKicker: "GOVERNANCE BY DEFAULT",
    governanceTitle: "The redesign gets brighter without becoming less honest.",
    governanceBody: "MEDORA still distinguishes implemented capability from connectivity claims. The visual layer is stronger, but the product truth remains careful, explicit, and reviewable.",
    governanceBullets: [
      "Tenant and branch isolation",
      "Append-only audit evidence",
      "Human review",
      "integration-gated external connectivity",
    ],
    ctaTitle: "Bring MEDORA to the level of a flagship healthcare product.",
    ctaBody: "Use the renewed public experience to introduce the platform, then move directly into the protected workspace for real operations.",
    footer: "Built for people who need healthcare software to feel calm, powerful, and accountable at the same time.",
  },
  ar: {
    brandTitle: "MEDORA | منظومة الرعاية الصحية المتكاملة",
    brandSubtitle: "وضوح سريري، وضبط تجاري، وذكاء منضبط",
    eyebrow: "MEDORA | جيل جديد من أنظمة التشغيل الصحية",
    title: "مساحة تشغيل آمنة وموحّدة لدورة الرعاية الصحية.",
    subtitle: "تعرض MEDORA نفسها الآن كسطح قيادة موحّد للصيدلية والرعاية والمالية والتوصيل والحوكمة والذكاء المساعد—هادئ للمشغّل، وصريح للمدقق، وثنائي اللغة من الأساس.",
    secureAccess: "دخول آمن",
    login: "تسجيل الدخول بأمان",
    workspace: "دخول مساحة العمل",
    adminBootstrap: "حساب الإدارة الأولي: admin / admin",
    floatingPanelTitle: "سطح تشغيل جذّاب ومنضبط",
    floatingPanelBody: "صفحة عامة تشرح المنتج بصدق، وتحافظ على لغة الحوكمة، وتقود المشغّل إلى المساحة المحمية من دون الادعاء بأن التكاملات المقيدة أصبحت حيّة بالفعل.",
    heroMetrics: [
      { label: "وحدات محمية", value: "+24", tone: "from-cyan-400 to-sky-500" },
      { label: "اللغات", value: "AR + EN", tone: "from-emerald-400 to-teal-500" },
      { label: "نموذج الضبط", value: "فشل آمن", tone: "from-violet-400 to-fuchsia-500" },
    ],
    commandDeckTitle: "منطق غرفة القيادة",
    commandDeckBody: "أصبحت القصة العامة متوافقة مع هيكل المستودع الفعلي: التشغيل، والرعاية، والمالية، والتوصيل، والهوية، والحوكمة، وجاهزية التكامل.",
    commandDeckPoints: [
      "يبقى الفرع والمؤسسة والاختصاص القانوني ظاهرة باعتبارها جزءاً من الحد الأمني.",
      "تظل المراجعة البشرية إلزامية للإجراءات المالية والسريرية والمنظمة الحساسة.",
      "يُوصف الاتصال الخارجي بأنه محكوم بمتطلبات التكامل حتى يتوفر دليل القبول.",
    ],
    platformKicker: "مساحة التشغيل",
    platformTitle: "كل نطاق يقرأ الآن كجزء من منظومة واحدة، لا كمجموعة شاشات منفصلة.",
    platformBody: "يوحّد هذا التجديد قصة المنتج عبر الواجهة، ومخطط المحتوى، ونسخة الموقع العام، بحيث تبدو MEDORA كنظام تشغيل صحي واحد لا كمجموعة وحدات متفرقة.",
    features: [
      { icon: Workflow, title: "قيادة التشغيل", body: "تظهر التدفقات اليومية والإجراءات الواعية بالفرع وحالات التقدم المنضبطة كطبقة تشغيلية موحدة." },
      { icon: Stethoscope, title: "حدود رعاية آمنة", body: "تبقى المسارات السريرية ومسارات الوصفات صريحة بشأن نطاقها المحمي وفشلها الآمن عند غياب الشروط." },
      { icon: WalletCards, title: "ضبط مالي", body: "تُعرض المالية ونقطة البيع وأرصدة الموردين والمساءلة كمنظومة تحكم تجاري منضبطة لا كلوحات مبهمة." },
      { icon: Truck, title: "تنسيق التوصيل", body: "يظهر اللوجستيات والإسناد والتنفيذ بين الفروع كبنية وفاء صحية حقيقية." },
      { icon: BrainCircuit, title: "ذكاء مساعد", body: "يبقى الذكاء الاصطناعي مساعداً وثنائي اللغة، يوضّح العمل من دون أن يدّعي سلطة ليست له." },
      { icon: Building2, title: "جاهزية مؤسسية", body: "تخاطب MEDORA العيادات والصيدليات والمستشفيات وشركات التأمين والتشغيل متعدد الفروع بلغة واحدة متسقة." },
    ],
    modelKicker: "مخطط التجربة",
    modelTitle: "أصبحت الصفحة مدفوعة بمخطط محتوى قابل لإعادة الاستخدام بدلاً من كتلة سردية جامدة.",
    modelBody: "يجمع مخطط التجربة العامة الرسائل الرئيسية، والقياسات، وبطاقات المجالات، ولغة الحوكمة، وهيكل الدعوة إلى الإجراء، بحيث تتطور قصة MEDORA نظيفاً عبر الصفحات وعمليات النشر.",
    modelSteps: [
      { id: "01", title: "مخطط السرد أولاً", body: "أصبحت قصة العلامة والقياسات والوحدات تأتي من ملف مخطط عام مخصص لتحقيق الاتساق." },
      { id: "02", title: "هرمية بصرية ثانية", body: "تؤكد الواجهة الآن على الإيقاع والتباين وتسلسل البطاقات مع الحفاظ على سهولة الاستخدام ثنائية اللغة." },
      { id: "03", title: "الحوكمة ظاهرة دائماً", body: "تبقى الحماية والمراجعة وحدود التكامل مدمجة في الصفحة بدلاً من إخفائها في الهوامش." },
    ],
    governanceKicker: "حوكمة افتراضية",
    governanceTitle: "أصبح التصميم أكثر إشراقاً من دون أن يفقد صدقه.",
    governanceBody: "ما زالت MEDORA تميّز بين القدرة المنفذة والاتصال الخارجي المزعوم. الطبقة البصرية أقوى، لكن حقيقة المنتج تبقى حذرة وصريحة وقابلة للمراجعة.",
    governanceBullets: [
      "عزل المؤسسة والفرع",
      "سجل تدقيق تراكمي",
      "المراجعة البشرية",
      "اتصال خارجي محكوم بمتطلبات التكامل",
    ],
    ctaTitle: "ارفع MEDORA إلى مستوى منتج صحي رائد.",
    ctaBody: "استخدم التجربة العامة المتجددة لتقديم المنصة، ثم انتقل مباشرة إلى مساحة العمل المحمية لتشغيل الأعمال الفعلية.",
    footer: "مصممة للناس الذين يحتاجون إلى برامج صحية هادئة وقوية وخاضعة للمساءلة في الوقت نفسه.",
  },
};

export const publicExperienceIcons = {
  command: CircleGauge,
  trust: ShieldCheck,
  access: LockKeyhole,
  truth: CheckCircle2,
  care: Activity,
};
