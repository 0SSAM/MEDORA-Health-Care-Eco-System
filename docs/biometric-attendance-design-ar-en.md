# Biometric Attendance Design | تصميم نظام الحضور البيومتري

## 1. Executive Summary | الملخص التنفيذي
MEDORA now includes a secure biometric verification layer for employee attendance. This implementation leverages **WebAuthn (Passkeys)** to provide device-based fingerprint or Face ID confirmation directly within the web application, ensuring that the person checking in is the authorized employee.

يتضمن نظام ميدورا الآن طبقة تحقق بيومتري آمنة لتسجيل حضور الموظفين. يعتمد هذا التنفيذ على تقنية **WebAuthn (Passkeys)** لتوفير تأكيد عبر بصمة الإصبع أو التعرف على الوجه من خلال الجهاز مباشرة داخل تطبيق الويب، مما يضمن أن الشخص الذي يسجل الحضور هو الموظف المصرح له.

## 2. Security Model | نموذج الأمان
The system follows a "Privacy-First" approach:
- **No Biometric Data Stored:** MEDORA never sees or stores your fingerprint or face data. The OS handles the verification and only sends a cryptographic proof to the server.
- **Device-Bound:** The verification is tied to the physical device (Phone/Laptop) owned by the employee.
- **Audit Trail:** Every biometric verification is logged in the tamper-evident audit trail.

يتبع النظام نهج "الخصوصية أولاً":
- **لا يتم تخزين بيانات بيومترية:** لا يقوم نظام ميدورا أبداً برؤية أو تخزين بيانات بصمة الإصبع أو الوجه. يقوم نظام التشغيل بمعالجة التحقق ويرسل فقط إثباتاً تشفيرياً إلى الخادم.
- **مرتبط بالجهاز:** يرتبط التحقق بالجهاز الفعلي (هاتف/كمبيوتر محمول) الذي يمتلكه الموظف.
- **سجل التدقيق:** يتم تسجيل كل عملية تحقق بيومتري في سجل التدقيق غير القابل للتلاعب.

## 3. Workflow | سير العمل
1. **Initiation:** Employee clicks "Biometric Check-In".
2. **Platform Prompt:** The browser triggers the native OS biometric prompt (Touch ID, Face ID, etc.).
3. **Verification:** Upon successful biometric match, the browser generates a proof.
4. **Server Confirmation:** The server validates the proof, GPS coordinates, and server-side timestamp before recording attendance.

1. **البدء:** ينقر الموظف على "تسجيل حضور بيومتري".
2. **طلب المنصة:** يطلق المتصفح طلب التحقق البيومتري الخاص بنظام التشغيل (بصمة الإصبع، الوجه، إلخ).
3. **التحقق:** عند تطابق البيانات البيومترية بنجاح، يقوم المتصفح بإنشاء إثبات.
4. **تأكيد الخادم:** يقوم الخادم بالتحقق من الإثبات، وإحداثيات الموقع (GPS)، والختم الزمني للخادم قبل تسجيل الحضور.

## 4. Technical Components | المكونات التقنية
- **Client Utility:** `client/src/lib/biometrics.ts` (WebAuthn Bridge).
- **Backend Router:** `server/routers/attendance.ts` (Verification Logic).
- **Database Schema:** Updated `employee_attendance` with `biometricVerified` and `biometricType` fields.

- **أداة العميل:** `client/src/lib/biometrics.ts` (جسر WebAuthn).
- **راوتر الخلفية:** `server/routers/attendance.ts` (منطق التحقق).
- **مخطط قاعدة البيانات:** تحديث جدول `employee_attendance` بحقول `biometricVerified` و `biometricType`.
