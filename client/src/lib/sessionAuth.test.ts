import { beforeEach, describe, expect, it } from "vitest";
import { clearSessionAuthHeaderCache, getSessionAuthHeader } from "./sessionAuth";

const storage = (value: string | null) => ({
  getItem: () => value,
});

describe("session auth header cache", () => {
  beforeEach(() => clearSessionAuthHeaderCache());

  it("extracts the mirrored session token", () => {
    expect(getSessionAuthHeader(storage("other=1; app_session_id=abc"), 1_000)).toEqual({
      Authorization: "Bearer abc",
    });
  });

  it("reuses the header within the short cache window", () => {
    let reads = 0;
    const source = { getItem: () => { reads += 1; return "app_session_id=abc"; } };
    expect(getSessionAuthHeader(source, 2_000)).toEqual({ Authorization: "Bearer abc" });
    expect(getSessionAuthHeader(source, 2_001)).toEqual({ Authorization: "Bearer abc" });
    expect(reads).toBe(1);
  });

  it("refreshes after expiry and fails closed when storage throws", () => {
    const failing = { getItem: () => { throw new Error("blocked"); } };
    expect(getSessionAuthHeader(failing, 3_000)).toEqual({});
    expect(getSessionAuthHeader(storage("app_session_id=def"), 13_001)).toEqual({
      Authorization: "Bearer def",
    });
  });
});
