# MEDORA Government Integration Readiness Handover

> **Status / الحالة:** This is a preparation and acceptance-control packet. It does **not** activate a government connection, submit data, or certify regulatory compliance.  
> هذه حزمة تجهيز وتحكم في القبول. وهي **لا** تفعّل اتصالاً حكومياً، ولا ترسل بيانات، ولا تمثل شهادة امتثال تنظيمي.

## Purpose / الغرض

This handover defines the evidence and review trail MEDORA requires before a separately authorized production activation can be considered. It supports the Egypt government connector boundary currently shown as `egypt-government`, including UPA, EDA, ETA, and UHIA-related workstreams where applicable. It does not assume that every authority shares a single API, credential, or acceptance process.

تحدد هذه الوثيقة الأدلة ومسار المراجعة المطلوبين قبل النظر في تفعيل إنتاجي منفصل ومصرح به. وهي تدعم حد الموصل الحكومي المصري الظاهر باسم `egypt-government`، بما في ذلك مسارات UPA وEDA وETA وUHIA عند انطباقها. ولا تفترض أن جميع الجهات تستخدم واجهة أو اعتمادًا أو عملية قبول موحدة.

## Mandatory acceptance packet / حزمة القبول الإلزامية

| Gate / البوابة | Required artifact / الدليل المطلوب | Owner / المسؤول | MEDORA treatment / معالجة ميدورا |
| --- | --- | --- | --- |
| Official technical specification / المواصفة التقنية الرسمية | Dated authority specification, allowed operations, schema and version | Regulatory and technical owners | Record provenance in the jurisdiction compliance pack; do not infer unsupported fields |
| Authority authorization / إذن الجهة المختصة | Written authorization identifying the organization, service and environment | Regulatory owner | Keep the connector blocked until independently reviewed |
| Organization and scope registration / تسجيل المؤسسة والنطاق | Approved facility, branch and jurisdiction identifiers | Organization owner | Enforce organization, branch and jurisdiction checks server-side |
| Managed secrets and identity / الأسرار والهوية المُدارة | Secret-manager reference and certificate/client identity lifecycle evidence | Security owner | Never place credential values, private keys, OTPs, or certificates in source, browser storage, audit text, or this document |
| Sandbox verification / اختبار بيئة الاختبار | Authority sandbox results using approved test data only | Integration lead | Preserve test evidence and use idempotent, bounded test cases |
| Data mapping and privacy review / خرائط البيانات والخصوصية | Approved mappings, minimization decision, retention and error handling | Data and privacy owners | Block transfers that exceed approved purpose or scope |
| Reliability contract / عقد الاعتمادية | Retry, idempotency, acknowledgement, rejection and reconciliation tests | Integration and operations owners | No production submission without verifiable acknowledgement and reconciliation behavior |
| Production acceptance / قبول الإنتاج | Written effective acceptance and go-live approval | Business and regulatory owners | A separate, audited authorization is required; packet completion alone never enables a network call |

## Operating workflow / مسار التشغيل

1. Create or update the country profile and versioned compliance pack through the existing jurisdiction workflow. Add source URL, effective date, review date, responsible owner, and evidence records. Do not mark a pack approved until its required evidence is independently verified.
2. Review the **Government Integration Readiness Packet** in the admin connector dashboard. It starts with all gates marked `missing`, which is intentional and not a defect.
3. Receive official documents through the organization’s approved secure channel. Store sensitive files in authorized object storage or institutional repositories. Keep only authorized metadata and a safe secret-manager reference in the operational record.
4. Conduct sandbox verification with non-production, approved test data. Record request/response contract behavior, acknowledgment semantics, idempotency, rejection handling, retention, and reconciliation outcomes.
5. Obtain written production acceptance. Conduct a security and privacy review, then create a separate change request for any actual adapter implementation or activation. The current application intentionally contains no route that can send government data.

## Security and evidence rules / قواعد الأمن والأدلة

MEDORA treats unavailable authorization, stale compliance evidence, missing jurisdiction scope, unavailable server confirmation, missing secret reference, or incomplete acceptance evidence as a hard block. The readiness packet is admin-only, returns no credential values, and emits a tamper-evident review record. A tamper-evident log improves investigation but does not replace access control, encryption, retention controls, or legal authorization.

تعامل ميدورا غياب الإذن، أو تقادم دليل الامتثال، أو غياب نطاق الاختصاص، أو عدم توفر تأكيد الخادم، أو غياب مرجع السر، أو نقص أدلة القبول بوصفه حجبًا إلزاميًا. حزمة الجاهزية متاحة للمسؤول فقط، ولا تعيد أي قيمة اعتماد، وتنتج سجل مراجعة مقاومًا للعبث. ولا يحل سجل التدقيق محل التحكم في الوصول أو التشفير أو الاحتفاظ أو الإذن القانوني.

## Explicit non-goals / ما لا تقوم به هذه الحزمة

- It does not create fabricated approvals, simulated authority responses, credentials, certificates, or production-like regulated data.
- It does not transmit to UPA, EDA, ETA, UHIA, insurers, or any other authority.
- It does not declare Egypt, a facility, a product, an invoice, a claim, or a workflow compliant or certified.
- It does not make a browser, local storage, or a generated token a trusted device credential.

## Activation change-request checklist / قائمة طلب التفعيل المنفصل

The later activation request must name the authority, operation, endpoint environment, data classifications, approved organization/branch/jurisdiction scope, secret reference, certificate lifecycle, test evidence, idempotency design, reconciliation owner, incident contact, rollback plan, effective authorization, and expiration/review date. If any item is missing or expires, the adapter must remain or return to `BLOCKED`.
