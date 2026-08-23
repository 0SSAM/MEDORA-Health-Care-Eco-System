#import "report-theme.typ": report-accent, report-theme

#show: report-theme.with(
  title: "ALDORA | Official Overview",
  author: "ALDORA Product Documentation",
  rhythm: "report",
  running-header: true,
)

#set text(font: ("Noto Sans", "Noto Sans Arabic", "Libertinus Serif"), size: 10.5pt)
#set par(justify: true, leading: 0.95em)
#show link: set text(fill: report-accent)

#let ar(body) = block(width: 100%, text(lang: "ar", dir: rtl)[#body])
#let en(body) = block(width: 100%, text(lang: "en", dir: ltr)[#body])
#let callout(title, body) = block(fill: rgb("eef6f5"), stroke: 0.7pt + rgb("9bc8c0"), radius: 6pt, inset: 10pt)[
  #text(weight: "bold", fill: report-accent)[#title] #v(0.25em) #body
]

// ---------- Title page ----------
#page(margin: (top: 22%, x: 2.2cm), numbering: none, header: none)[
  #set par(first-line-indent: 0em, justify: false)
  #align(center)[
    #text(size: 34pt, weight: "bold", fill: report-accent)[ALDORA]
    #v(0.45em)
    #text(size: 17pt, weight: "bold")[منظومة الرعاية الصحية المتكاملة]
    #v(0.7em)
    #text(size: 14pt, fill: luma(80))[Official Overview]
    #text(size: 12pt, fill: luma(95))[Philosophy, Meaning, and Cross-Platform Operation]
    #v(1.5em)
    #line(length: 45%, stroke: 1pt + report-accent)
    #v(1.5em)
    #text(size: 13pt)[وثيقة تعريفية رسمية ثنائية اللغة]
    #v(0.4em)
    #text(size: 11pt, fill: luma(80))[Formal bilingual product and operating philosophy brief]
    #v(2.4em)
    #callout([الحالة الوثائقية | Document status], [وصف رسمي للمنتج وفلسفته التشغيلية. لا يمثل اعتماداً حكومياً أو شهادة امتثال قانونية.] )
    #v(2em)
    #text(size: 10pt, fill: luma(90))[إصدار الوثيقة: 15 أغسطس 2026  •  Document version: 15 August 2026]
  ]
]

#page(numbering: none, header: none)[
  #outline(title: [المحتويات | Contents], indent: 1.5em)
]
#counter(page).update(1)

= الملخص التنفيذي | Executive Summary

#ar[
  *ALDORA* هي منظومة تشغيل صحية معيارية تهدف إلى جمع العمليات اليومية للصيدليات والفروع والجهات الصحية المتصلة بها في مساحة تشغيل واحدة، مع الحفاظ على عزل المؤسسة والفرع والاختصاص، وتسجيل العمليات الحساسة، وإظهار حدود التكاملات الرسمية بوضوح. لا تقوم فلسفة المنصة على الادعاء بأن كل اتصال أو اعتماد متاح تلقائياً، بل على بناء أساس مهني يمكن اختباره وتوسيعه عندما تتوافر الأدلة والصلاحيات الرسمية.
]

#en[
  *ALDORA* is a modular healthcare operations platform designed to bring together daily pharmacy, branch, and adjacent healthcare workflows in one operating space. It preserves organization, branch, and jurisdiction boundaries; records sensitive actions; and makes the status of official integrations explicit. Its philosophy is not to imply that every connection or approval is automatically available, but to provide a professional, testable foundation that can be extended when authoritative evidence and credentials are available.
]

#callout([المبدأ الحاكم | Governing principle], [كل عملية منظمة يجب أن تكون مرتبطة بالمؤسسة والفرع والاختصاص، وأن تتحول إلى مسودة واضحة أو تتوقف بأمان عند غياب الاتصال أو الاعتماد أو الدليل المطلوب. / Every regulated action is organization-, branch-, and jurisdiction-scoped and becomes an explicit draft or stops safely when connectivity, authorization, or required evidence is missing.])

= أين تعمل ALDORA؟ | Where Does ALDORA Operate?

#ar[
  صُممت *ALDORA* لتكون منصة تشغيل صحية متكاملة، وليست برنامجاً محصوراً في الصيدليات فقط. وهي تجمع بين إدارة العمليات، ونقاط البيع، والمخزون، والوصفات، الفوترة، خدمة العملاء، المتابعة، التقارير، التدقيق، والجاهزية للتكاملات الرسمية. ويختلف نطاق التفعيل حسب نوع المؤسسة وصلاحياتها واللوائح المعتمدة في الدولة أو الاختصاص.
]

#en[
  *ALDORA* is designed as an integrated healthcare operations platform, not as a pharmacy-only application. It combines operations management, POS, inventory, prescriptions, invoicing, customer care, follow-up, reporting, auditability, and readiness boundaries for official integrations. The activated scope varies by institution type, permissions, and the applicable jurisdictional rules.
]

#table(
  columns: (1.7fr, 2.5fr, 2.1fr),
  inset: 7pt,
  align: (left, left, left),
  [*القطاع الصحي*], [*ما الذي يقدمه النظام للقطاع؟*], [*Healthcare role*],
  [الصيدليات الفردية], [إدارة الأصناف والدفعات والمخزون، المبيعات، المرتجعات، الفواتير المحلية، الوصفات، العملاء، الطباعة، وسجل التدقيق.], [Pharmacy ERP, POS, inventory, prescriptions, returns, invoices, and audit trail.],
  [سلاسل الصيدليات والفروع], [إدارة متعددة الفروع مع عزل المؤسسة والفرع، التحويلات، التنبيهات، المؤشرات، وتوحيد السياسات مع اختلاف الاختصاص.], [Multi-branch operations, scoped access, transfers, alerts, KPIs, and policy coordination.],
  [المستشفيات الحكومية والخاصة], [أساس تشغيلي للصيدلية والمخزون والوصفات وخدمة المرضى والتقارير، مع إبقاء الربط الحكومي أو التأميني مغلقاً حتى الاعتماد الرسمي.], [Pharmacy, inventory, prescription, patient-service, and reporting foundations; official links remain approval-gated.],
  [الموزعون وشركات التوريد], [كتالوج ذو مصدر، دفعات وصلاحية، متابعة التوريد، نقاط إعادة الطلب، وسجل حركة الأصناف بين الجهات والفروع.], [Provenance-aware catalog, batches, expiry, procurement visibility, reorder planning, and movement traceability.],
  [شركات التأمين والجهات الدافعة], [أساس لتصنيف المطالبات ومتابعة دورة التأمين، دون الادعاء بوجود اتصال حي مع شركة أو منصة تأمين قبل توفير الاعتماد.], [Insurance lifecycle and claim-classification foundations; live payer connectivity requires credentials and approval.],
  [معامل التحاليل ومراكز التأهيل], [إدارة العملاء أو المرضى، المواعيد وسياق الخدمة، المتابعة، مركز الاتصال، السجلات التشغيلية، والتنبيهات وفق نطاق المؤسسة.], [Patient/customer operations, follow-up, call-centre foundations, and alerts within the organization scope.],
  [شركات الأدوية والمستلزمات], [إدارة الكتالوج، الشركات المصنعة، المصادر، التحقق والمراجعة، التوريد، وتتبع الأصناف والمستلزمات الطبية والتجميلية.], [Catalog governance, manufacturers, provenance, review, procurement, and medical/cosmetic supply traceability.],
  [الجهات الحكومية والرقابية], [لوحات جاهزية وأدلة تدقيق وحزم قواعد قابلة للمراجعة، مع بقاء الاتصال والتنفيذ الرسميين متوقفين على الصلاحيات والمواصفات المعتمدة.], [Readiness dashboards, audit evidence, and reviewable rule packs; official execution remains authority-gated.],
)

#ar[
  وبصيغة عملية، يمكن تقديم ALDORA باعتبارها *طبقة التشغيل والإدارة والتتبع* التي تربط الموظفين والفروع والبيانات والعمليات داخل المؤسسة الصحية. وهي لا تستبدل الجهة التنظيمية أو شركة التأمين أو نظام الحكومة، بل تهيئ المؤسسة لإدارة أعمالها داخلياً بطريقة منظمة، ثم تفتح التكاملات الخارجية عندما تصبح المتطلبات القانونية والفنية متاحة.
]

#en[
  In practical terms, ALDORA is the *operating, management, and traceability layer* connecting staff, branches, data, and workflows inside a healthcare organization. It does not replace a regulator, payer, or government system; it prepares the organization to operate coherently and opens external integrations only when legal and technical prerequisites become available.
]

#callout([الإجابة المختصرة | Short answer], [ALDORA is designed for pharmacies, pharmacy chains, hospitals, distributors, insurers and payers, laboratories, rehabilitation centers, pharmaceutical and medical-supply companies, and public-sector healthcare operations—using a modular scope that activates only what the organization is authorized and prepared to operate. / صُممت ALDORA للصيدليات وسلاسلها والمستشفيات والموزعين والتأمين والمعامل ومراكز التأهيل وشركات الأدوية والمستلزمات والجهات الصحية العامة، بنطاق معياري لا يفعّل إلا ما تسمح به صلاحيات المؤسسة واستعدادها.])

= ماذا يعني اسم ALDORA؟ | What Does ALDORA Mean?

#ar[
  *ALDO* ليس اختصاراً قانونياً أو اسماً لجهة حكومية، وإنما هو تفسير هوياتي وتسويقي مقصود يمكن استخدامه عند التعريف بالمنصة:
]

#align(center)[
  #text(size: 18pt, weight: "bold", fill: report-accent)[ALDO = Accessible · Localized · Dependable Operations]
  #v(0.5em)
  #text(size: 12pt)[تشغيل صحي متاح، محلي، ويمكن الاعتماد عليه]
]

#ar[
  وتعني *Accessible* أن النظام مصمم ليكون قابلاً للوصول عبر واجهة ويب متجاوبة، و*Localized* أنه يستوعب اللغة العربية والسياق المحلي وحزم القواعد الخاصة بكل دولة، و*Dependable Operations* أنه يركز على التشغيل القابل للتتبع والفشل الآمن والوضوح العملي. أما *ALDORA* فهي امتداد صوتي وهووي لـ *ALDO* مع دلالة الرعاية والاتساع المؤسسي، ويمكن تقديم الاسم تجارياً بصيغة: *ALDORA | Integrated Health System*.
]

#en[
  *ALDO* is not a legal acronym or the name of a government body. It is an intentional identity explanation that may be used in formal introductions:
]

#align(center)[
  #text(size: 16pt, weight: "bold", fill: report-accent)[Accessible · Localized · Dependable Operations]
  #v(0.4em)
  #text(size: 11pt)[Accessible healthcare operations that are localized and dependable.]
]

#en[
  *Accessible* describes browser-based, responsive access; *Localized* describes Arabic-first operation, local terminology, and country-specific rule packs; and *Dependable Operations* describes traceable workflows, safe failure, and operational clarity. *ALDORA* extends the ALDO identity with a broader healthcare and institutional character. This is a brand interpretation, not a historical claim about the origin of the name.
]

= فلسفة البناء | Building Philosophy

#ar[
  بُنيت ALDORA على فكرة أن النظام الصحي المهني ليس مجرد شاشة بيع أو قاعدة بيانات أصناف. إنما هو طبقات مترابطة تبدأ من هوية المؤسسة والفرع، ثم الصلاحيات، ثم البيانات ذات المصدر، ثم قواعد التشغيل، ثم السجل التدقيقي، ثم المخرجات والتكاملات. لذلك تُعامل العمليات المنظمة، مثل الوصفات والفواتير والتكاملات الحكومية، بدرجة حماية أعلى من المسودات التشغيلية غير المنظمة.
]

#en[
  ALDORA is built on the premise that a professional healthcare system is more than a sales screen or an item database. It is a set of connected layers: organization and branch identity, authorization, sourced data, operational rules, audit evidence, outputs, and integrations. Regulated actions such as prescriptions, invoices, and government connectors therefore receive stronger safeguards than non-regulated working drafts.
]

#figure(
  image("aldora-architecture.png", width: 100%),
  caption: [ALDORA architecture: modular healthcare operations with scoped controls.]
)

#table(
  columns: (1.2fr, 2fr, 2fr),
  inset: 7pt,
  align: (left, left, left),
  [*المحور*], [*بالعربية*], [*English*],
  [النطاق], [عزل المؤسسة والفرع والاختصاص على الخادم], [Server-enforced organization, branch, and jurisdiction isolation],
  [التتبع], [مصدر الصنف، رقم العملية، وسجل تدقيق قابل للمراجعة], [Catalog provenance, operation identifiers, and reviewable audit evidence],
  [الصدق التنظيمي], [لا ادعاء لاعتماد أو اتصال حكومي قبل اكتمال المتطلبات], [No claim of approval or live government connectivity before prerequisites exist],
  [المرونة], [تشغيل محدود مع الاتصال الضعيف ومسودات آمنة عند الانقطاع], [Bounded operation under weak connectivity and safe drafts during outages],
)

= كيف يعمل النظام؟ | How the System Works

#ar[
  تبدأ الرحلة بتحديد المؤسسة والفرع والاختصاص. بعد ذلك يختار المستخدم الوحدة المطلوبة من مساحة العمل أو من الاختصار المخصص لدوره. يتحقق الخادم من الصلاحية والنطاق وحالة القاعدة التنظيمية قبل قبول العملية. تُمنح العملية الحساسة رقماً قابلاً للتتبع وتسجيلاً تدقيقياً، بينما تظهر الحالات غير المكتملة بصراحة على أنها مسودة أو بانتظار المراجعة أو مغلقة بأمان.
]

#en[
  The operating journey begins by identifying the organization, branch, and jurisdiction. The user then opens a module from the workspace or from a role-relevant shortcut. The server checks authorization, scope, and rule readiness before accepting the action. Sensitive actions receive traceable identifiers and audit evidence, while incomplete states are shown honestly as drafts, pending review, or safely blocked.
]

+ يحدد المستخدم المؤسسة والفرع والاختصاص. / The user identifies the organization, branch, and jurisdiction.
+ يفتح الوحدة من مساحة العمل أو الاختصار المناسب لدوره. / The user opens the required module or role shortcut.
+ يتحقق الخادم من الصلاحية والنطاق وحالة القواعد. / The server checks authorization, scope, and rule readiness.
+ تُحفظ العملية مع التتبع والتدقيق عند السماح بها. / The permitted operation receives traceability and audit evidence.
+ تتحول العملية غير المكتملة إلى مسودة أو حظر واضح، لا إلى نجاح وهمي. / An incomplete operation becomes an explicit draft or safe block.

= Online و Offline | Connected and Offline Operation

#ar[
  لا يعني Offline أن النظام ينفذ كل العمليات بلا خادم أو شبكة. المقصود هو أن الواجهة تستطيع الاحتفاظ بمسودات محلية غير منظمة، وإظهار حالة الاتصال، ثم محاولة مزامنتها تلقائياً عند عودة الاتصال إذا كانت مؤهلة لذلك. أما الوصفات، والفواتير الضريبية، والتسويات المالية، والعمليات الحكومية المنظمة، فتظل محكومة بالتأكيد الخادمي ومبدأ الفشل الآمن.
]

#en[
  Offline does not mean that every operation can be completed without a server or network. It means that the interface can retain eligible, non-regulated local drafts, show connection state, and attempt controlled synchronization when connectivity returns. Prescriptions, tax invoices, financial settlement, and regulated government operations remain subject to server confirmation and fail-closed behavior.
]

#figure(
  image("aldora-resilience.png", width: 100%),
  caption: [Safe resilience flow: explicit offline drafts, controlled reconnect synchronization, and conflict review.]
)

#table(
  columns: (1.7fr, 2.2fr, 2.2fr),
  inset: 7pt,
  align: (left, left, left),
  [*الحالة*], [*المعالجة العربية*], [*English treatment*],
  [Online], [تنفيذ طبيعي مع تحقق الخادم والتدقيق], [Normal operation with server validation and audit],
  [Weak connection], [تحميل تدريجي، حالات واضحة، وعدم إخفاء الفشل], [Progressive loading, explicit states, and visible failures],
  [Offline], [حفظ مسودات غير منظمة فقط وفق السياسة], [Eligible non-regulated drafts only],
  [Reconnect], [مزامنة مؤهلة مع idempotency وسجل تعارضات], [Eligible synchronization with idempotency and conflict log],
  [Regulated unavailable], [حظر آمن أو انتظار تأكيد، دون نجاح وهمي], [Safe block or pending confirmation, never false success],
)

= التشغيل عبر الأجهزة | Cross-Platform Operation

#ar[
  تعمل ALDORA أساساً كتطبيق ويب متجاوب يمكن فتحه من متصفح حديث على الكمبيوتر أو الهاتف أو الجهاز اللوحي. لذلك لا يحتاج المستخدم إلى نسخة مختلفة لكل نظام تشغيل في نموذج الويب/PWA. ويمكن تثبيته كتطبيق ويب على الأجهزة التي يدعم متصفحها التثبيت، مع بقاء السياسات الأمنية والتوافق مرتبطة بإصدار المتصفح والجهاز الفعلي.
]

#en[
  ALDORA is primarily delivered as a responsive web application that can be opened in a modern browser on a computer, phone, or tablet. The web/PWA model avoids requiring a separate application build for each operating system. Where supported by the browser, it may be installed as a web app; security and compatibility still depend on the actual device and browser version.
]

#table(
  columns: (1.3fr, 2.4fr, 2.3fr),
  inset: 7pt,
  align: (left, left, left),
  [*المنصة*], [*خطوات التشغيل*], [*ملاحظات*],
  [Windows], [افتح الرابط في متصفح حديث، سجّل الدخول، ويمكن تثبيت الموقع كتطبيق من قائمة المتصفح.], [يناسب أجهزة المكتب ونقاط البيع وفق اختبار الطابعة والمتصفح.],
  [macOS], [افتح الرابط في Safari أو Chrome أو متصفح مدعوم، ثم ثبّت التطبيق إن توفر الخيار.], [تحقق من أذونات الطباعة والاتصال بالأجهزة الطرفية.],
  [Android], [افتح الرابط في Chrome أو متصفح مدعوم، ثم استخدم Add to Home Screen عند توفره.], [صمم الاستخدام للمس اللمسي والشاشات الصغيرة.],
  [iPhone / iPad], [افتح الرابط في Safari، ثم استخدم Add to Home Screen عند توفره.], [قد تختلف حدود التخزين والعمل الخلفي بحسب إصدار iOS وسياسات Safari.],
)

#callout([الإجابة المختصرة عند العرض | Short presentation answer], [ALDORA is one secure, responsive healthcare workspace. It runs through the browser across supported Windows, macOS, Android, and iOS devices; when the connection is weak, it preserves eligible drafts and communicates the state clearly; when the connection returns, it synchronizes only what policy allows. / ALDORA مساحة تشغيل صحية آمنة ومتجاوبة، تعمل عبر المتصفح على الأجهزة المدعومة، وتتعامل مع الاتصال الضعيف بمسودات مؤهلة ومؤشرات واضحة، ثم تزامن ما تسمح به السياسة عند عودة الاتصال.])

= ما المطلوب للتشغيل؟ | What Is Required?

#ar[
  يحتاج التشغيل إلى رابط النظام، ومتصفح مدعوم، وحساب مستخدم بصلاحيات مناسبة، واتصال بالشبكة للعمليات التي تتطلب تحققاً خادمياً. ولتشغيل المؤسسة فعلياً، يجب استكمال إعداد المؤسسة والفروع والمستخدمين وحزم الاختصاص، ثم ربط القنوات الرسمية بعد الحصول على الموافقات والبيانات الفنية. أما الطابعات والماسحات والأجهزة الطرفية فتحتاج إلى اختبار نوع الاتصال والتعريفات وبيئة التشغيل الخاصة بالمؤسسة.
]

#en[
  Operation requires the system URL, a supported browser, an authorized user account, and network access for workflows that require server confirmation. Production use additionally requires organization, branch, user, and jurisdiction setup, followed by official connector activation only after approvals and technical credentials are obtained. Printers, scanners, and other peripherals require device-specific connection and driver validation.
]

= حدود مهنية يجب توضيحها | Professional Boundaries

#ar[
  هذه الوثيقة تعريف رسمي بفلسفة النظام وطريقة تشغيله، وليست بديلاً عن التعاقد أو التسجيل القانوني أو اعتماد الجهات الرسمية. كما أن وجود واجهة جاهزية لموصل حكومي أو تأميني لا يعني وجود اتصال حي أو موافقة صادرة. وتحتاج حماية الحقوق المعنوية والملكية الفكرية إلى سجل منشأ تقني، واتفاقيات قانونية، وتسجيلات ملكية عند اللزوم؛ لا يستطيع الكود وحده أن يثبت كل حق قانوني.
]

#en[
  This document is an official product and operating overview; it is not a substitute for contracting, legal registration, or formal authority approval. A government or payer connector readiness screen does not mean that a live connection or approval exists. Protection of moral and intellectual rights should combine technical provenance evidence with legal agreements and registrations where appropriate; code alone cannot establish every legal right.
]

#table(
  columns: (2.3fr, 3.7fr),
  inset: 7pt,
  align: (left, left),
  [*لا ينبغي ادعاؤه*], [*الصياغة المهنية الصحيحة*],
  [اعتماد حكومي أو اتصال حي], [جاهزية تكامل محكومة وبوابة مغلقة حتى توافر الاعتماد والبيانات الفنية.],
  [تشغيل مالي كامل دون شبكة], [مسودات غير منظمة فقط أثناء الانقطاع؛ التسوية المنظمة تتطلب تأكيداً خادمياً.],
  [دعم مضمون لكل جهاز قديم], [دعم قابل للتحقق ضمن متصفحات وأجهزة وإصدارات مختبرة.],
  [إثبات الملكية بالكود وحده], [بصمة منشأ تقنية تُستكمل بالاتفاقيات والتسجيلات القانونية المناسبة.],
)

= الخاتمة | Closing Statement

#ar[
  *ALDORA* ليست مجرد نظام لإدارة المبيعات، بل إطار تشغيل صحي يوازن بين سهولة الاستخدام، التوطين، العزل الأمني، التتبع، والمرونة. وعندما يُسأل عن معنى الاسم يمكن الإجابة باختصار: *ALDO تعني Accessible, Localized, Dependable Operations؛ أي تشغيل صحي متاح، محلي، ويمكن الاعتماد عليه.* أما فلسفة النظام فهي أن السرعة لا تسبق السلامة، وأن العمل دون اتصال لا يتحول إلى نجاح وهمي، وأن كل تكامل رسمي يُفتح فقط عندما تتوافر الأدلة والصلاحيات.
]

#en[
  *ALDORA* is not merely a sales-management system. It is a healthcare operating framework that balances usability, localization, security boundaries, traceability, and resilience. When asked what the name means, the concise answer is: *ALDO means Accessible, Localized, Dependable Operations.* The system philosophy is that speed never overrides safety, offline work never becomes a false success, and official integrations open only when the required evidence and authority are present.
]

#align(center)[
  #v(1em)
  #text(size: 16pt, weight: "bold", fill: report-accent)[ALDORA | Integrated Health System]
  #v(0.5em)
  #text(size: 10pt, fill: luma(85))[Official bilingual overview • Product documentation • Version 2026-08-15]
]

= المراجع | References

- ALDORA Product Description and Identity Brief, internal project documentation, 2026-08-15.
- ALDORA Comprehensive Platform Audit, internal project documentation, 2026-08-15.
- ALDORA Operations and Resilience Documentation, internal project documentation, 2026-08-15.
- ALDORA Ownership Evidence Bundle, internal project documentation, 2026-08-15.

#pagebreak()
#align(center)[
  #text(size: 11pt, weight: "bold", fill: report-accent)[ملاحظة تحريرية | Editorial note]
  #v(0.7em)
  #text(size: 9pt)[
    تمت صياغة هذه الوثيقة بلهجة رسمية ثنائية اللغة، مع الحفاظ على الحدود الواقعية لما هو منفذ وما يتطلب اعتماداً أو تكاملاً خارجياً. التأثيرات البصرية هنا مقصودة لتوضيح البنية ومسار العمل، وليست بديلاً عن الاختبارات أو الاعتمادات القانونية.
  ]
]
