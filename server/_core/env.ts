/**
 * Runtime environment accessors. Values are read lazily so that the
 * zero-setup embedded database runtime (see ./embedded-database) can inject
 * `DATABASE_URL` / `JWT_SECRET` after process start and before any consumer
 * reads them. The shape of the object is unchanged for all consumers.
 */
export const ENV = {
  get appId() {
    return process.env.VITE_APP_ID ?? "";
  },
  get cookieSecret() {
    return process.env.JWT_SECRET ?? "";
  },
  get databaseUrl() {
    return process.env.DATABASE_URL ?? "";
  },
  get oAuthServerUrl() {
    return process.env.OAUTH_SERVER_URL ?? "";
  },
  get ownerOpenId() {
    return process.env.OWNER_OPEN_ID ?? "";
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
  get forgeApiUrl() {
    return process.env.BUILT_IN_FORGE_API_URL ?? "";
  },
  get forgeApiKey() {
    return process.env.BUILT_IN_FORGE_API_KEY ?? "";
  },
  get reportMailApiKey() {
    return process.env.RESEND_API_KEY ?? "";
  },
  get reportMailFrom() {
    return process.env.REPORT_FROM_EMAIL ?? "";
  },
  get auditSigningKey() {
    return process.env.AUDIT_SIGNING_KEY ?? "";
  },
};
