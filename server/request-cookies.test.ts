import { describe, expect, it } from "vitest";
import { attachRequestCookies, parseRequestCookies, readCookie } from "./_core/request-cookies";

describe("internal request cookie parsing", () => {
  it("parses the internal session cookie before tRPC context creation", () => {
    const token = "session-token.with_symbols";
    const req = { headers: { cookie: `theme=light; medora_internal_session=${token}` } };

    attachRequestCookies(req);

    expect(req.cookies).toEqual({
      theme: "light",
      medora_internal_session: token,
    });
    expect(readCookie(req.headers.cookie, "medora_internal_session")).toBe(token);
  });

  it("returns an empty object for absent or malformed headers without throwing", () => {
    expect(parseRequestCookies(undefined)).toEqual({});
    expect(parseRequestCookies("")).toEqual({});
    expect(readCookie("theme=light", "medora_internal_session")).toBeNull();
  });
});
