export type WorkspaceFailureCategory = "lazy_module_load" | "subtree_render";

const lazyModuleLoadSignature = /failed to fetch dynamically imported module|importing a module script failed|chunkloaderror|loading chunk/i;

export function classifyWorkspaceFailure(error: unknown): WorkspaceFailureCategory {
  const errorMessage = error instanceof Error ? error.message : "";
  return lazyModuleLoadSignature.test(errorMessage) ? "lazy_module_load" : "subtree_render";
}
