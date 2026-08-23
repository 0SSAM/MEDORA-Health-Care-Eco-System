# Assistant visual verification — 2026-08-21

## Published evidence

URL: https://aldorapharm-fwilugbd.manus.space/workspace

The authenticated test session displayed `MEDORA Showcase Manager`, role `manager`, and the expected workspace navigation. Before opening the assistant, the workspace showed the floating assistant control and the human-review wording.

After opening the assistant, the published version displayed the global Arabic error state `تعذر تحميل مساحة العمل` with `Diagnostic ID: fnv1a-b375f2b1` and the action `إعادة تحميل الواجهة`. This confirms that the currently published version still falls through the global workspace boundary; the new local assistant fallback is not yet published because the repair checkpoint has not been saved.

No question was submitted and no sale, prescription, purchase, permission change, or external message was executed. Pharmacist and cashier live visual accounts were not available in the provided credentials, so their production login acceptance remains environment-gated.

## Post-publish manager retest

URL: https://aldorapharm-fwilugbd.manus.space/workspace

After the latest deployment, the manager session loaded the workspace successfully and opening the assistant displayed the local fallback inside the assistant drawer rather than the global workspace error. The visible bilingual-safe state was: `مساعد MEDORA غير متاح مؤقتاً` and guidance that the assistant does not execute sales, purchases, or permissions, followed by `إعادة محاولة المساعد`. The workspace remained usable behind the drawer.

No prompt was submitted and no sensitive or operational action was executed. Only the manager account was available; pharmacist and cashier credentials were not supplied in this test.
