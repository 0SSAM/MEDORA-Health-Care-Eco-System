# MEDORA Cloudflare Free Authentication Rate Limit | تحديد معدل المصادقة المجاني في Cloudflare لميدورا

## Scope and prerequisite | النطاق والشرط المسبق

These steps apply only when the domain is an active zone in a Cloudflare account you administer. The current managed preview domain, `aldorapharm-fwilugbd.manus.space`, is provided by the managed application platform; do not attempt to create a Cloudflare zone or change DNS for that hostname. Apply this rule instead after assigning a custom domain that your organization owns and has proxied through Cloudflare.

Cloudflare documents one rate-limiting rule on the Free plan. Its Free plan supports **Path** and **Verified Bot** in the rule expression, counts by **IP**, and uses a fixed **10-second** counting and mitigation period. These limits mean the single rule should protect the highest-risk public surface: internal employee login and password recovery.[1]

تنطبق هذه الخطوات فقط عندما يكون النطاق منطقة فعالة في حساب Cloudflare تديره المؤسسة. النطاق التجريبي المدار الحالي `aldorapharm-fwilugbd.manus.space` صادر عن منصة التطبيق المدارة؛ لا تنشئ منطقة Cloudflare ولا تغيّر DNS لهذا المضيف. طبّق القاعدة بعد ربط نطاق مخصص تملكه المؤسسة وتم تمريره عبر Cloudflare.

توثق Cloudflare قاعدة واحدة لتحديد المعدل في الخطة المجانية. تدعم الخطة المجانية **Path** و**Verified Bot** في تعبير القاعدة، وتعدّ حسب **IP**، وتستخدم فترة ثابتة قدرها **10 ثوانٍ** للعد والمعالجة. لذلك يجب أن تحمي القاعدة الوحيدة أعلى سطح عام خطورة: دخول الموظفين الداخليين واستعادة كلمة المرور.[1]

## Exact dashboard configuration | الإعداد الدقيق في لوحة التحكم

1. Sign in to Cloudflare, select the organization-owned custom domain zone, then open **Security rules**.
2. Select **Create rule** → **Rate limiting rules**. Cloudflare’s documented dashboard workflow uses this path.[2]
3. Set **Rule name** to: `MEDORA — Auth API abuse guard`.
4. Under the rule expression builder, set **Field** to **URI Path**, **Operator** to **starts with**, and **Value** to `/api/trpc/auth.`. This single Free-rule match covers the deployed public procedures `auth.internalLogin`, `auth.requestPasswordReset`, and `auth.resetPassword` without applying the rule to clinical, ERP, scheduled, or static routes.
5. Do **not** enable a custom counting expression. That feature is unavailable on Free, and IP is the only supported counter characteristic on Free.[1]
6. Under **With the same characteristics**, use the Free-plan default **IP** counter. Do not attempt to use headers, cookies, request bodies, host, or method because those fields are not available on Free.[1]
7. Under **When rate exceeds**, set **10 requests** within **10 seconds**. This is intentionally stricter than the application’s broader 12-per-minute fallback because the edge rule only applies to the public authentication procedure prefix. It allows normal retry behavior while limiting rapid scripted bursts.
8. Under **Then take action**, choose **Managed Challenge** if it is available in the account interface. If it is not available, choose **Block**. Managed Challenge reduces the chance of a false positive stopping a legitimate healthcare employee; Block is the simpler Free fallback.
9. Under **Duration**, select **10 seconds**. This is the Free-plan mitigation duration.[1]
10. Leave **Also apply rate limiting to cached assets** disabled if the option is displayed. The rule targets API paths and should not count unrelated cached resources.[2]
11. Select **Deploy**. Do not create an overlapping second Free rule; the plan allows one.[1]

1. سجّل الدخول إلى Cloudflare، واختر منطقة النطاق المخصص المملوك للمؤسسة، ثم افتح **Security rules**.
2. اختر **Create rule** ثم **Rate limiting rules**. هذا هو المسار الموثق في لوحة Cloudflare.[2]
3. اضبط **Rule name** على: `MEDORA — Auth API abuse guard`.
4. في منشئ التعبير، اضبط **Field** إلى **URI Path** و**Operator** إلى **starts with** و**Value** إلى `/api/trpc/auth.`. يغطي هذا مسارات `auth.internalLogin` و`auth.requestPasswordReset` و`auth.resetPassword` العامة دون تطبيق القاعدة على المسارات السريرية أو ERP أو المهام المجدولة أو الملفات الثابتة.
5. لا تفعل تعبير عد مخصصاً؛ فهو غير متاح في الخطة المجانية ويظل IP هو خاصية العداد المدعومة.[1]
6. ضمن **With the same characteristics**، استخدم عداد **IP** الافتراضي للخطة المجانية.
7. ضمن **When rate exceeds**، اضبط **10 طلبات** خلال **10 ثوانٍ**.
8. ضمن **Then take action**، اختر **Managed Challenge** إذا كان متاحاً، وإلا اختر **Block**.
9. ضمن **Duration**، اختر **10 seconds**.
10. اترك خيار **Also apply rate limiting to cached assets** معطلاً إن ظهر.
11. اختر **Deploy** ولا تنشئ قاعدة مجانية ثانية متداخلة.

## Safe acceptance check | فحص القبول الآمن

After deployment, use a non-production test account from a single test IP. Submit one valid or deliberately invalid internal login request, confirm normal handling, then issue 11 rapid invalid test attempts. Confirm Cloudflare records a rate-limit event and returns the configured mitigation behavior. Wait at least 10 seconds and confirm one normal login is processed again. Do not perform this test with a production administrator account, patient account, automated cron identity, or real patient data.

بعد النشر، استخدم حساب اختبار غير إنتاجي من عنوان IP واحد. أرسل محاولة دخول داخلية واحدة صالحة أو غير صالحة عمداً وتأكد من المعالجة الطبيعية، ثم أرسل 11 محاولة اختبار غير صالحة بسرعة. تأكد من تسجيل Cloudflare لحدث تحديد معدل وإعادة سلوك المعالجة المحدد. انتظر 10 ثوانٍ على الأقل وتأكد من معالجة محاولة دخول طبيعية مجدداً. لا تستخدم حساب مسؤول إنتاجي أو حساب مريض أو هوية Cron آلية أو بيانات مرضى حقيقية في الاختبار.

## References | المراجع

[1] [Cloudflare, Rate limiting rules: Free-plan availability](https://developers.cloudflare.com/waf/rate-limiting-rules/)
[2] [Cloudflare, Create a rate limiting rule in the dashboard](https://developers.cloudflare.com/waf/rate-limiting-rules/create-zone-dashboard/)
