export const ISOLATED_SHOWCASE_ADMIN_OPEN_ID = "medora-showcase-manager-v1";

type ShowcaseSessionIdentity = {
  openId: string | null | undefined;
  sessionMode: string | null | undefined;
};

type ShowcaseOrganizationScope = {
  sessionMode: string | null | undefined;
  sessionOrganizationId: number | null | undefined;
  requestedOrganizationId: number;
};

/**
 * Grants an administrator-equivalent *showcase surface* only to the fixed Test
 * identity while its authenticated session remains in the isolated showcase mode.
 * It deliberately does not confer the global application-admin role.
 */
export function isIsolatedShowcaseAdministrator(input: ShowcaseSessionIdentity) {
  return input.openId === ISOLATED_SHOWCASE_ADMIN_OPEN_ID && input.sessionMode === "showcase";
}

/**
 * Showcase sessions are pinned to the organization resolved into their signed
 * internal session. Any foreign organization identifier must fail closed.
 */
export function isWithinShowcaseOrganizationScope(input: ShowcaseOrganizationScope) {
  return input.sessionMode !== "showcase" || input.sessionOrganizationId === input.requestedOrganizationId;
}
