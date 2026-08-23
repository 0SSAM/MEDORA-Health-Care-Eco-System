# Production Test Account Visual Acceptance — 2026-08-21

## Scope

Authenticated visual acceptance was performed on the published MEDORA site using the user-provided test account. The password is intentionally not recorded.

## Observed results

- Login succeeded and redirected to `/workspace`.
- Authenticated identity displayed as `MEDORA Showcase Manager` with role `manager` and `حساب عرض`.
- The active scope displayed as `فرع العرض التجريبي المعزول` with `بيانات عرض معزولة` and an explicit non-production warning.
- The workspace showed role-relevant summary actions, including new sale, returns, electronic prescription, inventory, procurement, customer service, and human-review controls.
- The assistant entry point was clearly visible on the home workspace and the assistant drawer opened successfully.
- The assistant displayed the safety boundary `إرشاد فقط، والمراجعة البشرية مطلوبة`.
- The assistant content request failed twice with the visible message `تعذر تحميل مساحة العمل الآن. أعد المحاولة أو اختر وحدة أخرى. لن يتم تنفيذ أي عملية حساسة أثناء فشل التحميل.` The retry control remained available.
- No sales, returns, inventory transfers, approvals, messages, or other operational transactions were submitted.
- Browser console inspection showed no console output; this does not establish successful assistant backend loading.

## Acceptance conclusion

Authentication, role identification, isolated branch scope, workspace visibility, assistant entry point, and fail-safe behavior passed visual acceptance. Assistant content loading did not pass; it is a production-environment defect or dependency availability issue requiring separate investigation. No live-provider success is claimed.
