# دليل ربط سنترال VoIP بنظام ميدورا | VoIP Integration Guide for MEDORA

يوضح هذا الدليل الخطوات التقنية اللازمة لربط سنترال الهاتف الفعلي (PBX/VoIP) بنظام ميدورا المتكامل لتمكين الاتصال المباشر وتتبع المكالمات.

This guide outlines the technical steps required to link a physical PBX/VoIP system with MEDORA to enable direct dialing and call tracking.

## ١. المتطلبات التقنية | Technical Requirements

لإتمام عملية الربط، يجب توفر ما يلي:
To complete the integration, the following are required:

*   **مزود خدمة VoIP**: حساب نشط يدعم بروتوكول SIP أو واجهة برمجة تطبيقات (API) مثل Twilio, Vonage, أو Asterisk محلي.
*   **خادم وسيط (Middleware)**: خادم لاستقبال طلبات الاتصال من ميدورا وتوجيهها للسنترال.
*   **بيانات الاعتماد**: (SIP Server, Username, Password, API Keys).

## ٢. خطوات الربط البرمجي | Integration Steps

### الخطوة الأولى: إعداد الموصل (Connector)
يجب إنشاء ملف جديد في `server/connectors/telephony.ts` للتعامل مع مزود الخدمة المختار.

### الخطوة الثانية: ربط واجهة المستخدم (Frontend Binding)
يحتوي نظام ميدورا بالفعل على وحدة `Call Centre`. يجب ربط أزرار الاتصال بطلب tRPC الجديد:
`trpc.communication.makeCall.mutate({ phoneNumber: "..." })`

### الخطوة الثالثة: تسجيل المكالمات (Call Logging)
يجب إعداد Webhook من السنترال لتحديث حالة التذاكر في جدول `call_tickets` عند انتهاء المكالمة أو تسجيلها.

## ٣. جدول الإعدادات | Configuration Table

| المتغير (Variable) | الوصف (Description) | المصدر (Source) |
| :--- | :--- | :--- |
| `VOIP_PROVIDER_URL` | عنوان خادم السنترال أو الـ API | مزود الخدمة |
| `VOIP_API_KEY` | مفتاح الوصول البرمجي | لوحة تحكم السنترال |
| `SIP_TRUNK_ID` | معرف الخط الخاص بالمؤسسة | إعدادات PBX |

---

**ملاحظة أمنية**: يجب دائماً استخدام بروتوكول TLS لتشفير حركة الاتصال الصوتي والبيانات الحساسة.
**Security Note**: Always use TLS protocol to encrypt voice traffic and sensitive data.
