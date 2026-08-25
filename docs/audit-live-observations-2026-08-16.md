# Live Audit Observations — 2026-08-16

## Public and login routes

Source checked: https://medorapharm-fwilugbd.medora.space/

The public landing page loaded successfully in Arabic RTL. The visible entry point `تسجيل الدخول بأمان` navigated to `/login`.

Source checked: https://medorapharm-fwilugbd.medora.space/login

The login route initially displayed `جارٍ التحقق من الجلسة…`, then resolved to the employee login form with username and password fields, a secure-login button, password-recovery button, and an administration-login path. No blank page or client-side error was observed after the session check completed. The page was visually usable at a 1280x720 viewport and showed the Arabic RTL layout.

The prior reported error was not submitted again because no authorized employee credentials were provided; testing must not invent or guess credentials.

## Initial runtime observations

The recent browser request log showed successful HTTP 200 responses for `auth.me` and `regional.myBranchJurisdictions` with security headers including `x-frame-options: DENY`, `x-content-type-options: nosniff`, and a restrictive permissions policy. Further protected-route testing requires an authorized logged-in session or a deliberately isolated staging account.

## Protected workspace without session

Opening `/workspace` without an authenticated session returned the workspace shell with `الوضع العام: تسجيل الدخول مطلوب`. Operational metrics were placeholders (`—`), activity and audit sections were empty, and the interface displayed a `تسجيل الدخول` action. No real customer, inventory, financial, or audit records were exposed. This is a deliberate shell-level experience; protected data queries must remain gated server-side.

## Invalid employee login

Submitted deliberately invalid credentials (`audit.invalid.user` / non-real password). The live UI returned the generic Arabic message `تعذر التحقق من البيانات حالياً. تأكد من الاتصال وحاول مرة أخرى.` and did not reveal account existence, database details, or stack traces. The submit button entered a loading state while the request was pending.

## Mobile visual verification

At 375×812, the public landing page, `/login`, and `/workspace` rendered successfully. RTL headings, the English toggle, primary navigation, warning banners, sync card, and workspace cards remained visible without horizontal clipping in the captured viewport. The workspace showed an authenticated-state-required shell and no real records. The login page was visually dense but usable; its lower form content continues below the viewport as expected.
