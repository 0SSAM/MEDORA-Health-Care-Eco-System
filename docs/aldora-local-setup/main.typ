#set page(paper: "a4", margin: (top: 1.7cm, bottom: 1.7cm, left: 1.8cm, right: 1.8cm), numbering: "1")
#set text(font: ("Noto Sans Arabic", "Noto Sans"), size: 10.5pt, lang: "ar")
#set par(justify: true, leading: 0.95em, spacing: 0.7em)
#set heading(numbering: "1.")
#show heading.where(level: 1): it => block(above: 1.1em, below: 0.45em, breakable: false)[
  #text(size: 15pt, weight: "bold", fill: rgb("0B6477"))[#it]
]
#show heading.where(level: 2): it => block(above: 0.8em, below: 0.3em)[
  #text(size: 12pt, weight: "bold", fill: rgb("0B6477"))[#it]
]
#show link: set text(fill: rgb("0B6477"))
#let codeblock(body) = block(fill: rgb("F1F5F9"), stroke: (left: 3pt + rgb("1AB7B1")), inset: 9pt, radius: 4pt, width: 100%)[#text(font: "DejaVu Sans Mono", size: 8.3pt, lang: "en")[#body]]
#let callout(title, body, color: rgb("E6FFFB")) = block(fill: color, stroke: (left: 3pt + rgb("0B6477")), inset: 10pt, radius: 5pt, width: 100%)[
  #text(weight: "bold", fill: rgb("0B6477"))[#title]
  #linebreak()
  #body
]

#align(center)[
  #text(size: 25pt, weight: "bold", fill: rgb("0B6477"))[ALDORA]
  #v(0.25em)
  #text(size: 17pt, weight: "bold")[إعدادات التشغيل المحلي لنظام ALDORA]
  #v(0.4em)
  #text(size: 12pt, fill: rgb("475569"))[Local Setup and Registration Guide]
  #v(1em)
  #line(length: 70%, stroke: 1.5pt + rgb("1AB7B1"))
  #v(1em)
  #text(size: 11pt)[دليل عملي لإعداد البيئة، قاعدة البيانات، وتشغيل منظومة الرعاية الصحية المتكاملة محلياً]
  #v(2em)
  #circle(radius: 1.1cm, fill: rgb("0B6477"), inset: 0.2cm)[#text(fill: white, size: 19pt, weight: "bold")[A]]
  #v(1.5em)
  #text(size: 9pt, fill: rgb("64748B"))[الإصدار 1.0 · 15 أغسطس 2026]
]

#pagebreak()

= نطاق الدليل

هذا الدليل يشرح الطريقة الصحيحة لتجهيز نسخة تطوير محلية من نظام ALDORA. يشمل ذلك تثبيت الاعتماديات، إعداد متغيرات البيئة، إنشاء قاعدة بيانات MySQL أو TiDB، تطبيق مخطط Drizzle، تشغيل الخادم، وإجراء فحوصات الجاهزية الأساسية.

#callout[حدود مهمة][هذا الدليل مخصص لبيئة التطوير المحلية. لا تستخدم قاعدة بيانات الإنتاج، ولا تضع مفاتيح حقيقية داخل المستودع أو ملفات الكود.]

= المتطلبات الأساسية

| المكوّن | المتطلب المقترح | الغرض |
|---|---|---|
| Node.js | إصدار حديث متوافق مع المشروع | تشغيل الخادم وأدوات البناء |
| pnpm | الإصدار المثبت في `package.json` | تثبيت الاعتماديات وتشغيل السكربتات |
| MySQL / TiDB | MySQL 8 أو TiDB متوافق | تخزين بيانات النظام |
| Git | اختياري | إدارة الإصدارات |
| متصفح حديث | Chrome أو Edge أو Safari أو Firefox | اختبار الواجهة |

يفضل تشغيل نسخة التطوير على جهاز منفصل عن الإنتاج، مع استخدام بيانات اختبار غير حقيقية وعدم إدخال بيانات مرضى أو بيانات صحية فعلية.

= تثبيت الاعتماديات

بعد فك ضغط ملفات المشروع، افتح الطرفية داخل المجلد الذي يحتوي على `package.json`:

#codeblock[
cd ALDORA-project
pnpm install
]

إذا لم يكن `pnpm` مثبتاً، ثبّته باستخدام مدير Node.js المناسب، ثم أعد تنفيذ الأمر السابق. لا تحذف `pnpm-lock.yaml`؛ فهو يثبت إصدارات الاعتماديات المستخدمة في المشروع.

= إنشاء قاعدة البيانات

أنشئ قاعدة منفصلة للتطوير باستخدام MySQL. نفّذ الأوامر التالية من حساب إداري، مع تغيير كلمة المرور إلى قيمة قوية وفريدة:

#codeblock[
CREATE DATABASE aldora_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'aldora_app'@'localhost' IDENTIFIED BY 'ضع_كلمة_مرور_قوية_هنا';
GRANT ALL PRIVILEGES ON aldora_dev.\* TO 'aldora_app'@'localhost';
FLUSH PRIVILEGES;
]

إذا كان خادم قاعدة البيانات على جهاز مختلف، استبدل `localhost` بعنوان الخادم. لا تمنح قاعدة البيانات وصولاً عاماً إلى الإنترنت. في الإنتاج، استخدم حساباً محدود الصلاحيات واتصالاً مشفراً عبر TLS/SSL.

= إعداد متغيرات البيئة

أنشئ ملفاً محلياً باسم `.env` داخل مجلد المشروع. يجب ألا يُرفع هذا الملف إلى GitHub أو يُرسل داخل أرشيف عام. استخدم القالب التالي ثم استبدل القيم التوضيحية بقيم بيئتك:

#codeblock[
NODE_ENV=development
DATABASE_URL=mysql://aldora_app:ضع_كلمة_المرور@127.0.0.1:3306/aldora_dev
JWT_SECRET=ضع_قيمة_عشوائية_طويلة_وفريدة

VITE_APP_ID=معرّف_تطبيق_OAuth
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=معرّف_المالك
OWNER_NAME=Hossam Naeim Osman

BUILT_IN_FORGE_API_URL=رابط_Built_in_Forge_API
BUILT_IN_FORGE_API_KEY=مفتاح_Built_in_Forge_API
VITE_FRONTEND_FORGE_API_URL=رابط_Forge_للواجهة
VITE_FRONTEND_FORGE_API_KEY=مفتاح_Forge_للواجهة
]

المتغيرات الأساسية لتشغيل الخادم وأوامر Drizzle هي `DATABASE_URL` و`JWT_SECRET`. تحتاج المصادقة الكاملة إلى متغيرات OAuth صحيحة. أما متغيرات Forge فتُستخدم بحسب الخدمات المدمجة التي تم تفعيلها في البيئة.

لتوليد قيمة آمنة لـ `JWT_SECRET` على Linux أو macOS:

#codeblock[
openssl rand -base64 48
]

في Windows PowerShell يمكن استخدام:

#codeblock[
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
]

#callout[تنبيه أمني][لا تضع كلمات المرور، مفاتيح OAuth، مفاتيح API، أو مفاتيح التوقيع داخل TypeScript أو داخل الواجهة الأمامية. استخدم مدير أسرار أو إعدادات البيئة المحلية.]

= تطبيق مخطط قاعدة البيانات

بعد تشغيل MySQL والتأكد من قراءة `DATABASE_URL`، نفّذ الأمر التالي من جذر المشروع:

#codeblock[
pnpm db:push
]

يقوم الأمر بتوليد ترحيلات Drizzle ثم تطبيقها على قاعدة البيانات المحددة. لا تنفذه على قاعدة الإنتاج أثناء الاختبار المحلي. إذا ظهر الخطأ `DATABASE_URL is required to run drizzle commands`، فتحقق من اسم المتغير ومكان ملف `.env`، ثم أعد فتح الطرفية.

يمكن تصدير المتغير مؤقتاً على Linux أو macOS للتشخيص:

#codeblock[
export DATABASE_URL='mysql://aldora_app:password@127.0.0.1:3306/aldora_dev'
]

= الفحوصات قبل التشغيل

نفّذ الأوامر التالية بالترتيب:

#codeblock[
pnpm check
pnpm test
pnpm build
]

يفحص `pnpm check` TypeScript، ويشغّل `pnpm test` اختبارات Vitest، بينما ينشئ `pnpm build` نسخة الإنتاج. معالجة أي خطأ قبل تشغيل بيئة العرض أفضل من تجاهله أثناء التطوير.

= تشغيل النظام محلياً

شغّل خادم التطوير بالأمر:

#codeblock[
pnpm dev
]

ثم افتح المتصفح على:

#codeblock[
http://localhost:3000
]

لإيقاف الخادم استخدم `Ctrl+C`. لا تستخدم `pnpm start` قبل تنفيذ `pnpm build`؛ لأن أمر التشغيل الإنتاجي يعتمد على ملفات `dist` الناتجة من البناء.

= تسجيل الدخول والمصادقة

يستخدم ALDORA مسار OAuth محمياً. لتفعيل تسجيل الدخول محلياً يجب أن تكون بيانات OAuth صحيحة وأن يكون عنوان callback التالي مسجلاً لدى مزود المصادقة:

#codeblock[
http://localhost:3000/api/oauth/callback
]

من دون بيانات OAuth صالحة يمكن فحص الواجهة العامة وبعض الأجزاء غير المحمية، لكن جلسات المستخدم المحمية لن تعمل بصورة كاملة. لا تنشئ حساباً عاماً ثابتاً بكلمة مرور معروفة داخل المشروع، لأن المنصة تتعامل مع عمليات صحية ومالية ومنظمة.

= قائمة التحقق النهائية

| الفحص | النتيجة المطلوبة |
|---|---|
| تثبيت الاعتماديات | نجاح `pnpm install` |
| اتصال قاعدة البيانات | نجاح `pnpm db:push` |
| TypeScript | نجاح `pnpm check` |
| الاختبارات | نجاح `pnpm test` |
| البناء | نجاح `pnpm build` |
| الواجهة | فتح `http://localhost:3000` |
| المصادقة | نجاح OAuth بعد تسجيل callback |
| الأمان | عدم وجود أسرار في Git أو الأرشيف |

#callout[مبدأ التشغيل الآمن][استخدم بيانات تطوير غير حقيقية، وقاعدة منفصلة عن الإنتاج، وحسابات وصلاحيات محدودة. يجب اختبار عزل المؤسسة والفرع، وسجل التدقيق، والفواتير، والوصفات، ووضع Offline قبل أي عرض أو انتقال إلى بيئة تشغيل فعلية.]

= مراجع المشروع

تعتمد هذه الإرشادات على ملفات المشروع التالية: `package.json`، و`server/_core/env.ts`، و`drizzle.config.ts`، و`drizzle/schema.ts`، بالإضافة إلى دليل المشروع الكامل ووثائق النسخ الاحتياطي والهجرة الموجودة داخل مجلد `docs/`.

#align(center)[
  #v(1em)
  #line(length: 70%, stroke: 1.5pt + rgb("1AB7B1"))
  #v(0.6em)
  #text(size: 9pt, fill: rgb("64748B"))[ALDORA · منظومة الرعاية الصحية المتكاملة]
]
