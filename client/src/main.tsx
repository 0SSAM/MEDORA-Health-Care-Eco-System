import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { startLogin } from "./const";
import "./index.css";
import { getSessionAuthHeader } from "./lib/sessionAuth";
import { installSafeGlobalDiagnostics, recordSafeUiDiagnostic } from "./lib/safeDiagnostics";

installSafeGlobalDiagnostics();

// The Cloudflare preview is an isolated static preview. Do not let a service
// worker from another MEDORA deployment serve stale assets into this preview.
const isCloudflarePreview = window.location.hostname === "medora-preview.hossam-naeim2002.workers.dev";
if ("serviceWorker" in navigator && window.isSecureContext && !isCloudflarePreview) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, { once: true });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;
  if (!isUnauthorized) return;
  startLogin();
};

const logClientApiError = (label: string, error: unknown) => {
  // Never emit API response bodies or user-provided messages in production logs.
  if (!import.meta.env.DEV) return;
  const trpcError = error instanceof TRPCClientError ? error : undefined;
  recordSafeUiDiagnostic("unhandled_ui_error", error, label);
  console.error(label, {
    code: trpcError?.data?.code ?? "UNKNOWN",
    httpStatus: trpcError?.data?.httpStatus ?? undefined,
  });
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    logClientApiError("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    logClientApiError("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        return getSessionAuthHeader();
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
