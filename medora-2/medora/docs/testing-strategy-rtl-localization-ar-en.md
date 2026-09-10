# MEDORA RTL and Bilingual UI Testing Strategy | استراتيجية اختبار RTL والواجهات الثنائية اللغة

## Purpose | الهدف

This strategy defines how MEDORA verifies that Arabic and English interfaces remain usable, readable, accessible, and semantically correct across RTL and LTR layouts. It covers automated checks, focused component tests, browser-based acceptance checks, responsive behavior, mixed-direction content, and release evidence.

تحدد هذه الاستراتيجية كيفية تحقق MEDORA من بقاء الواجهات العربية والإنجليزية قابلة للاستخدام والقراءة والوصول، وصحيحة دلاليًا عبر تخطيطات RTL وLTR. وتشمل الفحوصات الآلية واختبارات المكونات وفحوصات القبول في المتصفح والاستجابة للشاشات والمحتوى المختلط الاتجاهات وأدلة الإصدار.

> **Quality principle | مبدأ الجودة:** A translation is not complete until the layout, interaction order, data formatting, and accessibility behavior are correct in the target direction.
>
> لا تكتمل الترجمة حتى يكون التخطيط وترتيب التفاعل وتنسيق البيانات وسلوك الوصول صحيحًا في الاتجاه المستهدف.

## Supported Experience Matrix | مصفوفة التجربة المدعومة

| Dimension | Arabic experience | English experience | Required evidence |
|---|---|---|---|
| Language | Arabic copy, Arabic labels, Arabic empty/error states, and `lang="ar"`. | English copy, English labels, English empty/error states, and `lang="en"`. | Representative screenshots or browser assertions for every major workflow. |
| Direction | `dir="rtl"`; logical spacing and mirrored navigation where appropriate. | `dir="ltr"`; conventional navigation and alignment. | Direction assertion plus visual review at desktop and mobile widths. |
| Typography | Readable Arabic font fallback, connected glyphs, diacritics where present, and no clipping. | Readable Latin fallback, predictable weight, and no clipping. | Long-label and mixed-script checks. |
| Numbers and dates | Arabic or Latin numerals according to the configured jurisdiction/profile; dates remain unambiguous. | Locale-appropriate numerals and dates; no accidental direction reversal. | Formatter unit tests and representative UI assertions. |
| Mixed content | URLs, SKUs, invoice numbers, phone numbers, email addresses, and Latin product names remain legible inside RTL text. | Arabic names and notes remain readable inside LTR text. | Bidirectional-content fixture with punctuation and identifiers. |
| Interaction | Keyboard order follows the visual reading order; dialogs and menus remain anchored correctly. | Keyboard order follows the LTR visual order; dialogs and menus remain anchored correctly. | Keyboard acceptance checks and focus assertions. |

## Test Layers | طبقات الاختبار

### 1. Static and Source-Level Checks | الفحوصات الثابتة وفحوصات المصدر

Every pull request that changes UI, copy, locale behavior, or CSS should scan for hard-coded user-facing strings, stale brand keys, physical `left`/`right` properties where logical properties are required, missing direction attributes, and unsafe interpolation of translated content. The check should flag untranslated placeholders, accidental `MEDORA` or `MEDORA` protocol names, and environment keys that do not use the MEDORA namespace.

يجب على كل Pull Request يغيّر الواجهة أو النصوص أو سلوك اللغة أو CSS أن يفحص النصوص الظاهرة للمستخدم، ومفاتيح الهوية القديمة، وخصائص `left` و`right` الفيزيائية عندما تكون الخصائص المنطقية مطلوبة، وغياب سمات الاتجاه، وإدراج النصوص المترجمة بطريقة غير آمنة. يجب أن يكتشف الفحص العناصر غير المترجمة وأسماء البروتوكولات القديمة مثل `MEDORA` أو `MEDORA` ومفاتيح البيئة التي لا تستخدم نطاق MEDORA.

### 2. Unit and Component Tests | اختبارات الوحدة والمكونات

Localization utilities should be tested with Arabic and English fixtures for pluralization, interpolation, fallback behavior, missing keys, date formatting, number formatting, currency, timezone, and error messages. Components with directional behavior should be tested with both `dir="rtl"` and `dir="ltr"` wrappers. Test assertions should focus on semantic output, accessible names, and interaction state rather than brittle visual class names.

يجب اختبار أدوات الترجمة ببيانات عربية وإنجليزية للتثنية والجمع والإدراج والبدائل والمفاتيح المفقودة وتنسيق التاريخ والأرقام والعملة والمنطقة الزمنية ورسائل الخطأ. كما يجب اختبار المكونات ذات السلوك الاتجاهي داخل غلافي `dir="rtl"` و`dir="ltr"`. ينبغي أن تركز التأكيدات على المخرجات الدلالية والأسماء القابلة للوصول وحالة التفاعل بدل الاعتماد الهش على أسماء CSS.

Minimum component coverage includes the application shell, navigation, authentication, dashboards, POS/cart, inventory tables, prescription review, forms, dialogs, toasts, pagination, date pickers, charts, empty states, loading states, error states, and offline indicators.

يشمل الحد الأدنى لتغطية المكونات هيكل التطبيق والتنقل والمصادقة ولوحات المعلومات وسلة البيع وجداول المخزون ومراجعة الوصفات والنماذج والنوافذ المنبثقة والتنبيهات وتقسيم الصفحات واختيار التاريخ والمخططات والحالات الفارغة وحالات التحميل والخطأ ومؤشرات العمل دون اتصال.

### 3. Browser Acceptance Tests | اختبارات القبول في المتصفح

Run the same critical journeys in both languages and directions. The test harness should set the locale before navigation, assert the document language and direction, and capture failures with the active locale, viewport, route, and user role.

نفّذ مسارات العمل الحرجة نفسها باللغتين والاتجاهين. يجب أن يحدد إطار الاختبار اللغة قبل التنقل، ويتحقق من لغة المستند واتجاهه، ويسجل الفشل مع اللغة النشطة وحجم الشاشة والمسار ودور المستخدم.

| Journey | Arabic RTL checks | English LTR checks |
|---|---|---|
| Sign-in and session recovery | Arabic labels, RTL field order, error placement, password visibility control. | English labels, LTR field order, error placement, password visibility control. |
| POS sale | Product search, cart alignment, quantity controls, totals, receipt preview, confirmation focus. | Same behavior with LTR alignment and English receipt labels. |
| Inventory | Table column order, filter placement, FEFO/expiry indicators, pagination, numeric alignment. | Same behavior with LTR columns, filters, and numeric alignment. |
| Prescription review | Arabic clinical text, pharmacist confirmation, image/metadata layout, warning prominence. | English clinical text, confirmation flow, image/metadata layout, warning prominence. |
| Reports and finance | Dates, currency, totals, exports, chart labels, and bidirectional identifiers. | Dates, currency, totals, exports, chart labels, and Arabic names in LTR context. |
| Offline mode | Status message, queued-operation explanation, reconnect behavior, and safe restricted actions. | Same behavior with English status and explanatory copy. |

### 4. Visual Regression and Responsive Checks | الفحص البصري والاستجابة

Capture baseline screenshots for Arabic RTL and English LTR at minimum widths of 360px, 768px, 1024px, and 1440px. Review both light and dark themes where supported. Compare navigation, tables, forms, overlays, charts, charts with legends, long labels, and content-heavy pages. A change is acceptable only when differences are intentional, documented, and free of clipping, overlap, reversed icons, or unreadable text.

التقط لقطات مرجعية للغة العربية RTL والإنجليزية LTR عند عروض لا تقل عن 360 و768 و1024 و1440 بكسل. راجع النمطين الفاتح والداكن عند دعمهما. قارن التنقل والجداول والنماذج والنوافذ العائمة والمخططات والمخططات ذات وسائل الإيضاح والعناوين الطويلة والصفحات الكثيفة بالمحتوى. لا تُقبل التغييرات إلا إذا كانت مقصودة وموثقة وخالية من القص أو التداخل أو انعكاس الأيقونات أو النص غير المقروء.

## RTL-Specific Risk Catalogue | سجل مخاطر RTL

| Risk | Detection | Acceptance criterion |
|---|---|---|
| Physical positioning | Search for `margin-left`, `padding-right`, `left`, and `right` in directional UI. | Use CSS logical properties unless the physical side is intentional and documented. |
| Incorrect icon mirroring | Review arrows, chevrons, pagination, step indicators, and directional illustrations. | Icons communicate movement in the active reading direction. |
| Broken mixed text | Use Arabic sentences containing URLs, SKUs, phone numbers, email addresses, and Latin names. | Tokens remain selectable, readable, and visually associated with the correct label. |
| Focus order mismatch | Keyboard through forms, menus, dialogs, and tables. | Focus follows the intended visual and semantic order in both directions. |
| Overflow and clipping | Test long Arabic labels, translated validation messages, and narrow viewports. | No clipped text, hidden action, horizontal overflow, or inaccessible control. |
| Chart and table reversal | Compare axes, columns, legends, and totals in both directions. | Data meaning remains stable; only presentation direction changes where appropriate. |
| Direction leakage | Inspect nested LTR content within RTL screens and vice versa. | Nested content has an explicit direction when needed and does not disturb surrounding layout. |

## Accessibility and Usability Gates | بوابات الوصول وقابلية الاستخدام

The release gate requires keyboard navigation, visible focus, logical heading order, accessible names for controls, readable contrast, zoom tolerance, reduced-motion compatibility, and screen-reader-friendly language and direction metadata. Arabic and English must not be treated as image-only text. Error messages must identify the field, explain the correction, and remain discoverable after validation.

تتطلب بوابة الإصدار التنقل بلوحة المفاتيح، وبؤرة مرئية، وتسلسل عناوين منطقي، وأسماء قابلة للوصول لعناصر التحكم، وتباينًا مقروءًا، وتحمل التكبير، والتوافق مع تقليل الحركة، وبيانات لغة واتجاه مناسبة لقارئات الشاشة. لا يجوز التعامل مع العربية أو الإنجليزية كنص داخل صور فقط. يجب أن تحدد رسائل الخطأ الحقل وتشرح التصحيح وتبقى قابلة للاكتشاف بعد التحقق.

## Automation Plan | خطة الأتمتة

The repository already uses Vitest for server and client tests. The next automation increments should add a localization contract suite, a direction wrapper helper, bidirectional-content fixtures, and browser smoke coverage for the critical journeys. If a browser runner is introduced, it should publish artifacts only for failed tests and must redact tokens, patient-like data, and production URLs.

يستخدم المستودع حاليًا Vitest لاختبارات الخادم والعميل. وتشمل خطوات الأتمتة التالية إضافة مجموعة عقود للترجمة، ومساعد لتغليف الاتجاه، وبيانات اختبار للمحتوى ثنائي الاتجاه، وفحوصات browser smoke لمسارات العمل الحرجة. وعند إدخال مشغل متصفح، يجب نشر المخرجات للفحوصات الفاشلة فقط مع إخفاء الرموز والبيانات الشبيهة ببيانات المرضى وروابط الإنتاج.

## Release Evidence | أدلة الإصدار

A bilingual UI release is ready only when the pull request contains the changed locale list, test commands and results, viewport matrix, screenshots or links to redacted artifacts for visual changes, known limitations, and confirmation that no secret, build artifact, dependency cache, or local log was included.

لا يكون إصدار الواجهة الثنائية اللغة جاهزًا إلا عندما يحتوي Pull Request على قائمة اللغات المتغيرة وأوامر الاختبار ونتائجها ومصفوفة عروض الشاشة ولقطات أو روابط إلى مخرجات منزوعة الحساسية للتغييرات البصرية والقيود المعروفة وتأكيد عدم تضمين أي سر أو مخرج بناء أو تخزين اعتماديات أو سجل محلي.

## References | المراجع

- [MEDORA README](../README.md)
- [MEDORA Contribution Guide](../CONTRIBUTING.md)
- [MEDORA Security Policy](../SECURITY.md)
- [MDN: CSS logical properties and values](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values)
- [W3C: Language tags and direction](https://www.w3.org/International/questions/qa-html-language-declarations)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)

---

© 2026 MEDORA Health Care Eco System. Private project.
