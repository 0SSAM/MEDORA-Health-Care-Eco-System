# MEDORA White-Hat Security Hardening Report | تقرير تقوية أمن ميدورا بأسلوب القبعة البيضاء

**Date:** 2026-08-26
**Scope:** Canonical MEDORA healthcare application source, dependency graph, production build, browser runtime, and selected deployed HTTP boundaries.
**Safety posture:** Additive changes only. No database migration, patient/clinical/financial data mutation, role change, secret rotation, external activation, or destructive source-history operation was performed.

## 1. Executive summary | الملخص التنفيذي

The review confirmed that MEDORA already had meaningful server-side protections, including request-origin enforcement for cookie-authenticated mutations, bounded parsers, role- and NDA-aware procedures, tenant/branch/jurisdiction checks in reviewed ERP flows, protected cron callbacks, and no-store behavior for API responses. A live safe probe confirmed that a cross-site mutation is rejected with HTTP 403 before application routing. Production and complete dependency audits reported no known high-severity findings, and the source scan found no likely committed credential or private-key pattern.

The implemented remediation removes a broad `https:` allowance from executable and connection CSP directives, replaces the blocked inline service-worker bootstrap with trusted bundled code, adds explicit rate-limit metadata, preserves transport upgrades only on already-secure requests, and adds `Origin-Agent-Cluster: ?1` consistently. During validation, the team discovered and corrected a pre-existing production bundle initialization failure caused by manual vendor chunking and a legacy `react-is` resolution. The deployment now builds, mounts in a production browser, and passes automated unit, integration, and end-to-end checks.

تؤكد المراجعة أن ميدورا كانت تملك ضوابط خادمية مهمة مسبقاً، منها فرض أصل الطلب على تعديلات الجلسات المعتمدة على ملفات الارتباط، ومحللات طلبات محدودة، وإجراءات تراعي الدور واتفاقية عدم الإفصاح، وفحوص نطاق المؤسسة والفرع والاختصاص القضائي في مسارات ERP التي تمت مراجعتها، ونداءات Cron محمية، ومنع تخزين ردود الواجهة البرمجية. وأكد فحص حي آمن أن تعديلًا عابرًا للموقع يُرفض برمز HTTP 403 قبل وصوله إلى التوجيه التشغيلي. كما لم يظهر تدقيق حزم الإنتاج أو التدقيق الكامل ثغرات معروفة عالية الخطورة، ولم يكشف فحص المصدر عن نمط مرجح لمفتاح خاص أو اعتماد مضمّن.

تزيل المعالجة المنفذة سماحية `https:` الواسعة من توجيهات CSP الخاصة بالبرامج النصية والاتصالات، وتنقل تهيئة عامل الخدمة المحجوبة سابقاً من HTML المضمّن إلى الشفرة المجمعة الموثوقة، وتضيف بيانات معيارية للتقييد، وتحافظ على ترقية النقل فقط للطلبات الآمنة بالفعل، وتضيف ترويسة `Origin-Agent-Cluster: ?1` باستمرار. وأثناء التحقق اكتشف الفريق وأصلح خللاً سابقاً في تهيئة حزمة الإنتاج نتج عن التقسيم اليدوي لحزم الموردين واعتماد `react-is` قديم. أصبح الإصدار الآن يُبنى ويُعرض في متصفح إنتاجي ويمر باختبارات الوحدة والتكامل والاختبارات الشاملة.

## 2. Validated findings and remediation | النتائج المعتمدة والمعالجة

| ID | Severity before | Evidence | Safe remediation | Verification |
|---|---:|---|---|---|
| SH-01 | High | The live CSP allowed `script-src 'self' https:` and `connect-src 'self' https:`, allowing any HTTPS origin in these directives. | Restricted executable sources to the application, `files.manuscdn.com`, and the configured HTTPS analytics origin; restricted connections to self plus analytics. | Focused CSP tests, production browser rendering, and E2E suite passed. |
| SH-02 | Medium | The inline service-worker registration conflicted with a CSP that correctly blocks inline scripts. | Moved registration to `client/src/main.tsx`, which is delivered by the trusted self-hosted module bundle. | Production browser showed the application mount; E2E passed. |
| SH-03 | Medium | Throttled routes returned HTTP 429 but did not expose limit, remaining, or reset metadata; retry time was fixed rather than window-aware. | Added `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, and an exact positive `Retry-After`. | Ten focused security middleware and policy tests passed. |
| SH-04 | Low / hardening | Browser process isolation was not explicitly requested. | Added `Origin-Agent-Cluster: ?1` on every response. This is a browser isolation hint, not a standalone security guarantee. | Middleware contract test passed; header observed in the local production response. |
| REL-01 | High availability defect | Production browser rendered a blank page; the controlled import identified a React module initialization error. | Removed the custom manual Rollup chunk partition and pinned transitive `react-is` to `19.2.1`, matching React and React DOM. | Production browser loaded the landing surface; 4/4 Playwright tests passed. |
| INT-01 | Integrity | The release manifest correctly detected the modified security source. | Updated only the recorded SHA-256 digest after reviewing the final source. | Source-integrity contract passed in the full test suite. |

> **CSP is defense in depth, not a substitute for safe application code.** OWASP explains that CSP can restrict remote scripts and dynamic connections, but should complement—not replace—secure development practices.[1]

> **`Origin-Agent-Cluster` is not claimed as a memory-security boundary.** MDN describes it as a request for origin-keyed agent clustering and cautions that browsers may ignore it or implement it without process-level memory protection.[2]

## 3. Controls confirmed during review | الضوابط المؤكدة أثناء المراجعة

| Control area | Confirmed state | Evidence retained |
|---|---|---|
| Cross-site mutation protection | Active and fail-closed for reviewed mutation requests. | Live safe probe returned HTTP 403; focused middleware tests passed. |
| Session and credential handling | Internal sessions are opaque, hashed server-side, time-bounded, revocable, and protected by password-policy and lockout helpers. | Reviewed policy, context, router, DB lifecycle, and focused tests. |
| Tenant and regulated-data scope | Reviewed ERP routes derive and check organization, branch, and jurisdiction scope server-side. | ERP router review and existing contract coverage. |
| Scheduled callbacks | Reviewed inventory automation validates authenticated cron identity and task UID before scoped execution. | Scheduled handler review and policy tests. |
| Response hardening | `nosniff`, framing denial, referrer/permissions controls, cross-origin controls, cache boundaries, HSTS on HTTPS, CSP, and OAC are active. | Live header capture and middleware tests. |
| Supply chain and source hygiene | `pnpm audit --audit-level=high` returned no known vulnerabilities; the source-integrity contract and SHA-256 manifest pass. | Audit and 832 passing test assertions. |

## 4. Verification record | سجل التحقق

| Gate | Result |
|---|---|
| Focused security tests | Passed: 20 assertions across session, auth, header, origin, and limiter contracts. |
| TypeScript | Passed: `pnpm check`. |
| Full Vitest | Passed: **256 files passed**, 3 skipped; **832 tests passed**, 10 skipped. |
| Production build | Passed: `pnpm build`. |
| Production smoke test | Passed: `MEDORA smoke check passed`. |
| Browser runtime | Passed: controlled local production instance rendered MEDORA after remediation. |
| Playwright E2E | Passed: **4/4** public Arabic/English, persistence, RTL geometry, and registered-route tests. |
| Dependency audit | Passed: no known vulnerabilities at high severity threshold. |
| Diff hygiene | Passed: `git diff --check`; generated Playwright report artifact was excluded from the release diff. |

## 5. Residual risks and free edge firewall boundary | المخاطر المتبقية وحدود جدار الحماية المجاني عند الحافة

The implemented in-process limiter is deliberately a **defense-in-depth** control. In an autoscaled deployment, it is local to an instance and cannot provide a global distributed throttling guarantee. OWASP notes that rate limiting can be implemented at both infrastructure and application layers; the two layers should be complementary.[3] No edge configuration was changed from this source-code session.

For the domain administrator, the most valuable free edge action is to use the available **single Cloudflare Free rate-limiting rule** for the authentication surface. Cloudflare currently documents one Free rule, IP counting, 10-second periods, and path-based matching; rule availability and exact UI fields remain plan-dependent.[4] Configure and test it in the provider dashboard rather than applying it blindly:

| Recommended free-tier edge rule | Suggested safe starting value | Purpose |
|---|---|---|
| Match | Authentication paths under `/api/trpc/auth.` and `/api/oauth/callback` using the dashboard’s supported path expression | Adds distributed edge resistance before requests reach the application. |
| Count | Client IP | Aligns with the current application-layer limiter while remaining provider-managed. |
| Threshold | Start conservatively at **10 requests / 10 seconds** | Protects login and reset surfaces while allowing normal interactive flows. |
| Action and duration | Block or managed challenge for **10 seconds**; observe security events before increasing strictness | Avoids locking out legitimate healthcare staff during rollout. |
| Exclusions | Do not apply to scheduled callback paths or verified operational health probes without a separately reviewed rule | Preserves managed automation availability. |

The selected GitHub integration did not authorize Dependabot or Code Scanning alert-list APIs, which returned HTTP 403. This report therefore does **not** claim that those alert queues are empty. A repository administrator should review open GitHub security alerts and branch protections directly. No database or infrastructure configuration was changed in this session.

إن التقييد المطبق داخل العملية هو عمداً طبقة **دفاع إضافية**. ففي نشر قابل للتوسع يكون محلياً لكل نسخة ولا يمكنه ضمان تقييد موزع على جميع النسخ. وتوضح OWASP أن التقييد يمكن أن يطبق في البنية التحتية وعلى مستوى التطبيق معاً، ولذلك ينبغي أن تتكامل الطبقتان.[3] لم يُعدّل أي ضبط للحافة من خلال هذه الجلسة المصدرية.

لدى مسؤول النطاق، الإجراء المجاني الأكثر فائدة هو استخدام **قاعدة تحديد معدل واحدة متاحة في خطة Cloudflare المجانية** على سطح المصادقة. توثق Cloudflare حالياً قاعدة مجانية واحدة، والعد حسب IP، وفترات من 10 ثوانٍ، والمطابقة المعتمدة على المسار؛ كما أن الإتاحة والحقول الدقيقة تتبع الخطة.[4] اضبطها واختبرها في لوحة المزود ولا تطبقها بصورة عمياء.

| قاعدة الحافة المجانية المقترحة | قيمة بداية آمنة | الغرض |
|---|---|---|
| المطابقة | مسارات المصادقة تحت `/api/trpc/auth.` و`/api/oauth/callback` وفق تعبير المسار المدعوم في اللوحة | إضافة مقاومة موزعة عند الحافة قبل وصول الطلب للتطبيق. |
| العد | عنوان IP للعميل | ينسجم مع التقييد داخل التطبيق مع بقاء الضبط مداراً من المزود. |
| الحد | ابدأ بحذر عند **10 طلبات / 10 ثوانٍ** | حماية أسطح الدخول والاستعادة مع السماح بالتدفق التفاعلي الطبيعي. |
| الإجراء والمدة | حظر أو تحدٍّ مدار لمدة **10 ثوانٍ** مع مراقبة الأحداث قبل التشديد | تجنب تعطيل موظفي الرعاية الشرعيين عند الإطلاق. |
| الاستثناءات | لا تشمل مسارات النداءات المجدولة أو فحوص الصحة التشغيلية الموثقة دون قاعدة منفصلة ومراجعة | الحفاظ على توفر الأتمتة المدارة. |

لم تمنح صلاحية تكامل GitHub المختارة حق الوصول إلى واجهات سرد تنبيهات Dependabot أو Code Scanning، وأعادت HTTP 403. لذلك لا يدعي هذا التقرير أن قوائم التنبيه خالية. وينبغي لمسؤول المستودع مراجعة التنبيهات المفتوحة وحماية الفروع مباشرة. ولم تتغير قاعدة البيانات أو ضبط البنية التحتية في هذه الجلسة.

## 6. Recovery | الاستعادة

The pre-remediation checkpoint is **`646aa61a`**. The final checkpoint will preserve this hardened state as a separate, recoverable release. If any operational issue is observed after publication, restore using the project version history rather than manually reverting unrelated files.

نقطة التحقق السابقة للمعالجة هي **`646aa61a`**. ستحفظ نقطة التحقق النهائية الحالة المقواة كإصدار مستقل قابل للاستعادة. وإذا ظهر أي خلل تشغيلي بعد النشر، فاستخدم سجل إصدارات المشروع للاستعادة بدلاً من التراجع اليدوي عن ملفات غير مرتبطة.

## References | المراجع

[1] [OWASP, Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
[2] [MDN, Origin-Agent-Cluster header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin-Agent-Cluster)
[3] [OWASP, Denial of Service Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
[4] [Cloudflare, Rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)
