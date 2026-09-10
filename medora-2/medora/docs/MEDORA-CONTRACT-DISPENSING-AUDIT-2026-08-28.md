# تدقيق نظام صرف التعاقدات الطبية — MEDORA (2026-08-28)
# Medical Contract Dispensing Flow Audit

> الوضع: مُعدّ من قراءة فعلية لملفات المستودع في هذه الجلسة. كل سطر يحمل مسار الملف الفعلي. لا يُدّعى وجود ما لم يُعثر عليه.

## السلسلة الكاملة (Contract → Eligibility → Approval → Dispense → Claim → Settle)

| المرحلة | الكيان / المسار الفعلي | الحالة |
|---|---|---|
| 1) العقد (Payer Contract) | `insurance_payer_contracts` + `insurance_payer_contracts_ref_idx`, `insurance_payer_contracts_scope_status_idx` في `drizzle/schema.ts` | ✅ موجود |
| 2) أهلية/تغطية (Eligibility/Coverage) | `insurance_requests` مع `requestType = ELIGIBILITY` في `server/routers/insurance.ts` (حالات: DRAFT…APPROVED…CANCELLED) + تحقق حزمة الامتثال `assertCompliancePackUsable` (`server/domain/regional-engine.ts`) | ✅ موجود |
| 3) إذن مسبق (Preauthorization) | `insurance_preauthorizations` (جدول) + `requestType = PREAUTHORIZATION` في `server/routers/insurance.ts` | ✅ موجود |
| 4) الفحص/العرض الطبي (Encounter) | `healthcare_encounters`, `healthcare_clinical_orders`, `healthcare_admissions` في `drizzle/schema.ts` + `egypt-healthcare` router | ✅ موجود |
| 5) الوصفة (Prescription) | `e_prescriptions` (+ فهرس `e_prescriptions_patient_scope_idx`) في `drizzle/schema.ts` — **حالة الصرف (dispensed/fulfilled) داخل أعمدة الجدول تحتاج تحققًا إضافيًا من أعمدة البيانات الفعلية** | 🟡 جزئي |
| 6) صرف/تنفيذ (Dispense/Issue) | لا يوجد إجراء صرف (dispense) مستقل مكتشف بعد في `server/routers` — يُنفّذ ضمن سياق الصيدلية/المخزون (`catalog_items`, `inventory_batches` FEFO) | ⚠️ **ناقص** (يعتمد على وحدة الصيدلية) |
| 7) مطالبة (Claim) | `insurance_claims` + `insurance_claim_lines` + `insurance_claims_idempotency_idx` (منع التكرار) + `insurance_claims_scope_number_idx/status_idx` في `drizzle/schema.ts` | ✅ موجود |
| 8) استئناف/تسوية (Appeal/Settlement) | `insurance_appeals_claim_idx` (جدول الاستئنافات) في `drizzle/schema.ts` — **تسوية مالية (settlement) وسجل تحصيل (collection ledger) لم يُعثر عليهما بعد** | 🟡 جزئي |
| 9) مضاد الاحتيال (Anti-Fraud) | `server/routers/anti-fraud.ts` + إشارات `contract/claim` في `assistant.ts`, `erp.ts`, `secondaryModules.ts` | ✅ موجود |
| 10) سجل التدقيق (Audit) | `audit_logs` + سجلات موقعّة (`hashAuditRecord` في `server/domain/internal-auth.ts`) | ✅ موجود |

## ملاحظات دقيقة
- `hr_contracts` هو **عقد عمل (HR)** وليس عقدًا طبيًا — لا تخلط بينهما في المتطلبات.
- `production_authorized / pending_approval / not_authorized` قيم enum تتعلق بأوامر الإنتاج — خارج سلسلة التأمين.
- **الخلاصة:** 8 من 10 مراحل موجودة بأدلة؛ الناقص/الجزئي: (أ) إجراء صرف وصفة بآلة حالات صريحة، (ب) جدول تسوية التحصيل وربطه بـ `insurance_claims`.
- يعمل موجّه `insurance` على نمط **branch+jurisdiction** (رؤوس `branches`/`branchJurisdictions`) — وهذا يتعارض مع سياسة "لا فروع" في نفس الملفات؛ التنفيذ الجديد يجب أن يمرر `branchId` اختياريًا بـ `organizationId` فقط أو يدعم كليهما حسب نشرك.

## توصيات (P0–P2)
- **P0:** إضافة إجراءين لمكوّن الصرف: `prescriptions.dispense` (حالة: prescribed → dispensed → returned) وسجل صرف `prescription_dispenses` (من، متى، كمية، دفعة مخزون).
- **P1:** جدول `insurance_settlements` (claim_id, amount_egp, paid_at, method, receipt_no) + إجراء `claims.settle`.
- **P2:** لوحة تحصيل شهرية (إجمالي المطالبات المعتمدة مقابل المحصّل) داخل `reports`.
