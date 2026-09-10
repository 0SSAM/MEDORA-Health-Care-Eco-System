# MEDORA | Backup and Restore Runbook

## النسخ الاحتياطي والاستعادة — Arabic / English

### مبادئ إلزامية | Mandatory principles

- لا تُخزّن مفاتيح التشفير داخل النسخة نفسها أو داخل المستودع.
- لا تُستعاد نسخة مباشرة إلى الإنتاج قبل اختبارها في بيئة معزولة.
- لا تُحذف سجلات المصدر أو سجل التدقيق لإخفاء فشل الاستعادة.
- لا تُعد النسخة ناجحة إلا بعد التحقق من سلامة قاعدة البيانات والملفات والسياسات.

- Never store encryption keys inside the backup or repository.
- Never restore directly into production before an isolated rehearsal.
- Never delete source or audit evidence to hide a restore failure.
- A backup is successful only after database, file, and policy verification.

### Online backup

1. تحقق من وقت UTC والنطاق والمؤسسة والإصدار.
2. نفذ النسخة من مزود تخزين معتمد مع تشفير أثناء النقل والتخزين.
3. احفظ metadata: version, timestamp, operator, scope, key-version, checksum.
4. ارفع سجل التنفيذ إلى مساحة تدقيق لا تسمح بالتعديل العادي.
5. اختبر عينة استعادة دورية في بيئة معزولة.

### Offline encrypted export

لا يُستخدم التصدير غير المتصل إلا بتفويض المالك ومسؤول IT. يجب إنشاء ملف مشفر بكلمة مرور/مفتاح خارج الملف، وتحديد تاريخ انتهاء، وحفظ سجل custody. يمنع وضع الملف أو المفتاح على جهاز شخصي غير مُدار.

Offline exports require owner and IT authorization. The encrypted file must have key custody outside the file, an expiry date, and a custody log. Do not place either artifact on an unmanaged personal device.

### Restore acceptance

| Check | Evidence |
|---|---|
| Database opens | Isolated connection and migration version |
| Tenant boundaries | Cross-tenant denial tests |
| Sensitive data | Expected encryption and redaction behavior |
| Files | Logo, PDF reference, and object metadata sample |
| Audit | Hash-chain verification and no unexplained gaps |
| Business totals | Sales, returns, VAT, inventory reconciliation |
| Authentication | Login, role, 2FA state, and session expiry checks |
| Decision | Named approver, UTC time, restore version, exceptions |

### Incident response

عند فشل النسخة، أوقف الاستعادة، احتفظ بالنسخة الفاشلة، سجّل الخطأ دون أسرار، وابدأ نسخة بديلة. عند الاشتباه بتسريب مفتاح، أوقف استخدامه وابدأ تدويراً موثقاً، ثم قيّم نطاق التعرض وفق خطة الحوادث المؤسسية.

If a backup fails, stop the restore, retain the failed artifact, record the error without secrets, and start a controlled alternative. If a key may be exposed, revoke/rotate it through the approved process and assess the exposure scope.
