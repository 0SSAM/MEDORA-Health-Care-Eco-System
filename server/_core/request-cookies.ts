import { parse as parseCookie } from "cookie";

export function parseRequestCookies(header: string | undefined) {
  return parseCookie(header ?? "");
}

export function attachRequestCookies<T extends { headers: { cookie?: string } }>(request: T) {
  return Object.assign(request, { cookies: parseRequestCookies(request.headers.cookie) });
}

export function readCookie(header: string | undefined, name: string) {
  return parseRequestCookies(header)[name] ?? null;
}
