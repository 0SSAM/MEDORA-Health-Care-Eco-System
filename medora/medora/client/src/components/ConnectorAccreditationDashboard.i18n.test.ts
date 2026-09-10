import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const dashboard = readFileSync(resolve(import.meta.dirname, "ConnectorAccreditationDashboard.tsx"), "utf8");
const readinessPacket = readFileSync(resolve(import.meta.dirname, "GovernmentIntegrationReadinessPacket.tsx"), "utf8");

describe("connector readiness localization contract", () => {
  it("switches dashboard and readiness packet copy with the active language and logical direction", () => {
    expect(dashboard).toContain('const { language, direction } = useLocalization()');
    expect(dashboard).toContain('dir={direction}');
    expect(dashboard).toContain('Connectors and accreditation centre');
    expect(dashboard).toContain('Clear filters');
    expect(readinessPacket).toContain('const { language, direction } = useLocalization()');
    expect(readinessPacket).toContain('dir={direction}');
    expect(readinessPacket).toContain('Government integration readiness packet');
    expect(readinessPacket).toContain('Copy review summary');
    expect(readinessPacket).not.toContain('dir="rtl"');
  });

  it("retains the fail-closed policy and prevents implied external activation", () => {
    expect(dashboard).toContain('Fail-closed policy');
    expect(dashboard).toContain('No external activation is available at this stage.');
    expect(readinessPacket).toContain('Connectors remain fail-closed until every gate is complete.');
    expect(readinessPacket).toContain('cannot activate an external connector');
  });
});
