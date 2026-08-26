# Test accounts | حسابات الاختبار

Test accounts and the isolated showcase environment have been retired. No reusable test credentials are maintained in this repository.

تم إلغاء حسابات الاختبار وبيئة العرض المعزولة. لا يحتفظ هذا المستودع بأي بيانات اعتماد اختبار قابلة لإعادة الاستخدام.

For automated tests, create short-lived identities inside an ephemeral database and inject credentials only through the CI secret manager. Never use production data or commit passwords, tokens, session cookies, or database dumps.

للاختبارات الآلية، أنشئ هويات مؤقتة داخل قاعدة بيانات مؤقتة، ومرّر بيانات الاعتماد عبر مدير أسرار CI فقط. يُمنع استخدام بيانات الإنتاج أو Commit لكلمات المرور والرموز وملفات الجلسات ونسخ قواعد البيانات.
