const testDefaults: Record<string, string> = {
  AUDIT_SIGNING_KEY: "ci-test-audit-signing-key-not-for-production-2026",
  SHOWCASE_TEST_PASSWORD: "CI-only-showcase-password-2026",
  OAUTH_SERVER_URL: "http://127.0.0.1:3999",
  VITE_ALDO_SALES_CONTACT_URL:
    "https://wa.me/201550571454?text=MEDORA%20CI%20configuration%20check",
  VITE_APP_TITLE: "ميدورا | منظومة الرعاية الصحية المتكاملة",
  VITE_APP_LOGO: "https://example.invalid/aldo-app-icon_9eb86e20.png",
};

for (const [key, value] of Object.entries(testDefaults)) {
  process.env[key] ??= value;
}
