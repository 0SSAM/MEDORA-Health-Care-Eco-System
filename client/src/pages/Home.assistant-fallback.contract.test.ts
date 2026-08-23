import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(import.meta.dirname, "Home.tsx"), "utf8");

describe("assistant workspace fallback contract", () => {
  it("isolates lazy-load failures from the rest of the workspace", () => {
    expect(source).toContain("function AssistantWorkspaceErrorState({ organizationId, branchId, onRetry }");
    expect(source).toContain("MEDORA assistant is temporarily unavailable");
    expect(source).toContain("مساعد MEDORA غير متاح مؤقتاً");
    expect(source).toContain("No sale, prescription, purchase, permission change, or external message was executed.");
    expect(source).toContain("لم يتم تنفيذ أي بيع أو وصفة أو شراء أو تغيير صلاحيات أو رسالة خارجية.");
    expect(source).toContain("Retry assistant");
    expect(source).toContain("إعادة محاولة المساعد");
  });

  it("re-imports the assistant locally and mounts the recovery wrapper in both entry points", () => {
    expect(source).toContain("const createAssistantSupportWorkspace = () => lazy(");
    expect(source).toContain("function ReloadableAssistantSupportWorkspace(");
    expect(source).toContain("const [loadVersion, setLoadVersion] = useState(0);");
    expect(source).toContain("const AssistantWorkspace = useMemo(() => createAssistantSupportWorkspace(), [loadVersion]);");
    expect(source).toContain("setLoadVersion(version => version + 1);");
    expect(source).toContain("onRetry={() => retryAssistantLoad(onRetry)}");
    expect(source).toContain("<ReloadableAssistantSupportWorkspace organizationId={selectedOrganizationId} branchId={activeBranchId} screen={activeModule.id} isOverlay initialDraft={assistantDraft} />");
    expect(source).toContain("if (active === \"assistant\") return <ReloadableAssistantSupportWorkspace organizationId={organizationId} branchId={branchId} screen=\"المساعد ومركز الدعم\" />;");
    expect(source).toContain("recordWorkspaceLoadFailure");
    expect(source).not.toContain("window.location.reload()");
  });

  it("keeps the assistant drawer usable across phone and larger viewports", () => {
    expect(source).toContain("!w-[calc(100vw-1rem)]");
    expect(source).toContain("sm:!w-[min(34rem,calc(100vw-2rem))]");
    expect(source).toContain("sm:!max-w-[34rem]");
  });

  it("provides a semantic title and description for the assistant drawer", () => {
    expect(source).toContain('DrawerContent, DrawerDescription, DrawerTitle');
    expect(source).toContain('<DrawerTitle className="sr-only">MEDORA AI</DrawerTitle>');
    expect(source).toContain('<DrawerDescription className="sr-only">');
  });
});
