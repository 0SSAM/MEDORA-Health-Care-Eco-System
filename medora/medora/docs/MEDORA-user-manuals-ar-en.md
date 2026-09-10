# MEDORA | دليل الاستخدام حسب الدور

## Bilingual role-based user manual — Arabic / English

**الإصدار:** 2026-08-15  
**النطاق:** الصيدلية والفروع والعمليات الصحية الحالية  
**ملاحظة:** لا يحتوي هذا الدليل على كلمات مرور أو أسرار أو بيانات مرضى.

## البدء الآمن | Safe start

سجّل الدخول بالحساب المؤسسي المخصص لك، وتحقق من اسم المؤسسة والفرع والاختصاص قبل تنفيذ أي عملية. إذا ظهر أن الموصل الحكومي أو التأميني مغلق، فهذا يعني أن الاعتماد أو المواصفات لم تُثبت بعد، وليس أن العملية نجحت في الخلفية.

Sign in with your assigned organizational account and verify the organization, branch, and jurisdiction before acting. A blocked government or insurance connector means that credentials, specifications, or acceptance evidence are not available; it must not be interpreted as a successful background submission.

## مركز الاختصارات | Shortcut center

يفتح زر لوحة المفاتيح في رأس مساحة العمل **دليل الاختصارات**. يعرض النظام الاختصارات المتاحة للسياق الحالي، وتعمل داخل التطبيق فقط وتتوقف أثناء الكتابة في الحقول. لا تعتمد الاختصارات على الصلاحية وحدها؛ فكل إجراء حساس يتحقق منه الخادم.

The keyboard button in the workspace header opens the **Shortcut Center**. It shows shortcuts relevant to the current context, works inside the application, and pauses while the user is typing in a field. Shortcuts never replace server authorization.

| مثال الاختصار | الوظيفة | الفئة المستفيدة |
|---|---|---|
| اختصار فاتورة بيع جديدة | فتح مساحة POS | Cashier, pharmacist, branch manager |
| اختصار المرتجعات | فتح دورة المرتجع وربط الفاتورة الأصلية | Cashier, branch manager |
| اختصار الوصفة | فتح الوصفات قيد المراجعة | Doctor, pharmacist |
| اختصار الكتالوج | البحث ومراجعة المصدر | Catalog reviewer, pharmacist |
| `?` أو زر لوحة المفاتيح | عرض دليل الاختصارات | جميع المستخدمين |

## الصيدلي والكاشير | Pharmacist and cashier

ابدأ من POS، ابحث بالاسم العربي أو الإنجليزي أو الباركود، راجع الدفعة والكمية، ثم اترك الخادم يتحقق من المخزون والضريبة والصلاحية. لا تُعدّل إجمالي الضريبة يدوياً. للمرتجع استخدم الفاتورة الأصلية، تحقق من الكمية والسياسة، ثم انتظر نتيجة الخادم.

Open POS, search by Arabic or English name or barcode, review batch and quantity, and let the server validate stock, tax, and authorization. Never manually override server-calculated totals. For a return, link the original invoice, verify the quantity and policy, and wait for the server result.

## الطبيب | Doctor

أنشئ الوصفة ببيانات المريض الضرورية فقط، راجع الاسم والجرعة والكمية، ثم أرسلها إلى حالة التحقق. لا تعتبر الوصفة مصروفة قبل تحقق الصيدلي، ولا ترسل بيانات حساسة خارج المسار المؤسسي.

Create prescriptions with the minimum necessary patient data, review medicine, dose, and quantity, and submit them for verification. A prescription is not dispensed until a pharmacist verifies it.

## خدمة العملاء ومركز الاتصال | Customer care and call centre

استخدم ملف العميل والتذكرة للمتابعة التشغيلية. تجنب تسجيل معلومات سريرية غير لازمة أو تسجيلات صوتية تلقائية. عند انقطاع الشبكة، احفظ مسودة غير منظمة فقط، ثم راجع التعارض قبل المزامنة.

Use customer profiles and tickets for operational follow-up. Avoid unnecessary clinical details and automatic sensitive recordings. When offline, save only a non-regulated draft and review conflicts before synchronization.

## مدير الفرع | Branch manager

راجع التنبيهات، المخزون، الفواتير، المرتجعات، وحالة التكاملات ضمن نطاق فرعك. لا تستخدم حسابك لتجاوز صلاحيات المؤسسة أو اعتماد موصل رسمي غير مكتمل.

Review alerts, inventory, invoices, returns, and connector readiness within your branch. Do not use your account to bypass organization scope or activate an incomplete official connector.

## مراجع الكتالوج | Catalog reviewer

استخدم شاشة المراجعة الجماعية، افحص المصدر والترخيص والباركود والسعر والمصنع، ثم اقبل أو ارفض السجل. السجل غير الموثق يبقى في العزل ولا ينتقل تلقائياً إلى الإنتاج.

Use the bulk review screen, inspect source, license, barcode, price, and manufacturer, then approve or reject the row. Unverified data remains quarantined and is not promoted automatically.

## حالات الاتصال | Connection states

| الحالة | الإجراء المسموح |
|---|---|
| Online | العمليات المؤهلة بعد تحقق الخادم |
| Slow or unstable | انتظر نتيجة الخادم، لا تضغط الإرسال عدة مرات، واحتفظ برقم الطلب |
| Offline | مسودات غير منظمة فقط؛ لا مبيعات أو فواتير أو صرف أو خصم مخزون |
| Server confirmation unavailable | إيقاف العملية الحساسة وفتح حالة مراجعة |

## الطباعة وPDF | Printing and PDF

يمكن معاينة الفاتورة الضريبية المحلية قبل التنزيل، اختيار حجم الورق، ثم الطباعة أو التصدير. الملف محلي للعرض والطباعة، ولا يمثل إرسالاً رسمياً إلى ETA.

You can preview the local tax invoice, choose paper size, and print or export it. The PDF is a local presentation artifact and does not represent official ETA submission.

## مساعدة سريعة | Quick help

إذا لم يظهر اختصار أو زر، فغالباً يعود ذلك إلى الدور أو الفرع أو حالة الاعتماد. لا تحاول الالتفاف عبر رابط مباشر؛ اطلب من المسؤول مراجعة الصلاحية وسجل التدقيق.

If a shortcut or button is missing, it is usually due to role, branch, or readiness state. Do not bypass the UI with direct URLs; ask an administrator to review authorization and audit evidence.

## References

1. [MEDORA comprehensive platform audit](comprehensive-platform-audit-2026-08-15.md)
2. [MEDORA operations guide](operations.md)
3. [MEDORA product description](MEDORA-product-description-ar-en.md)
