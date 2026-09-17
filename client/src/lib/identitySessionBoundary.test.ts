import { describe, expect, it, vi } from "vitest";
import { COOKIE_NAME } from "@shared/const";
import { clearStoredSessionAuth, getSessionAuthHeader } from "@/lib/sessionAuth";
import { resetIdentityBoundClientState } from "@/lib/identitySessionBoundary";

describe("resetIdentityBoundClientState", () => {
  it("removes the preceding OAuth header mirror at an internal identity boundary", () => {
    let storedCookie = `${COOKIE_NAME}=first-account`;
    const storage = {
      getItem: () => storedCookie,
      removeItem: vi.fn(() => { storedCookie = ""; }),
    };

    expect(getSessionAuthHeader(storage, 10).Authorization).toBe("Bearer first-account");

    clearStoredSessionAuth(storage);

    expect(storage.removeItem).toHaveBeenCalledWith("manus-cookie");
    expect(getSessionAuthHeader(storage, 11).Authorization).toBeUndefined();
  });

  it("clears the query cache at an identity boundary", () => {
    const clear = vi.fn();
    resetIdentityBoundClientState({ clear });

    expect(clear).toHaveBeenCalledOnce();
  });
});
