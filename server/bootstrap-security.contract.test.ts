import { describe, expect, it } from "vitest";
import { getBootstrapProvisioningCredentials } from "./bootstrap";

describe("bootstrap provisioning security", () => {
  it("stays disabled until every explicit runtime control is supplied", () => {
    expect(getBootstrapProvisioningCredentials({})).toBeNull();
    expect(getBootstrapProvisioningCredentials({
      MEDORA_BOOTSTRAP_ALLOW_PROVISIONING: "true",
      MEDORA_BOOTSTRAP_ADMIN_USERNAME: "Admin",
    })).toBeNull();
  });

  it("accepts only explicit runtime credentials and never provides a fallback", () => {
    expect(getBootstrapProvisioningCredentials({
      MEDORA_BOOTSTRAP_ALLOW_PROVISIONING: "true",
      MEDORA_BOOTSTRAP_ADMIN_USERNAME: "  bootstrap-admin  ",
      MEDORA_BOOTSTRAP_ADMIN_PASSWORD: "runtime-only-test-value",
    })).toEqual({ username: "bootstrap-admin", password: "runtime-only-test-value" });
  });
});
