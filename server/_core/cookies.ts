import type { CookieOptions, Request } from "express";
import * as cookieModule from "cookie";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

type ParsedCookies = Record<string, string | undefined>;

// cookie v2 renamed `parse` to `parseCookie`; support both package generations
// without spreading that migration across every server route.
export const parseCookie = (cookieModule as unknown as {
  parseCookie?: (value: string) => ParsedCookies;
  parse?: (value: string) => ParsedCookies;
}).parseCookie ?? (cookieModule as unknown as {
  parse: (value: string) => ParsedCookies;
}).parse;

function isIpAddress(host: string) {
  if (/^\\d{1,3}(\\.\\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

export function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // Keep host-only cookies for local and single-host deployments. Cross-host
  // deployments can still use the secure SameSite=None options below.
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),
  };
}
