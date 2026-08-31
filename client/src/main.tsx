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

// Cloudflare preview is a static asset surface, not the production PWA.
// Clear stale service workers/caches from older preview builds so a cached
// shell can never mask a newly deployed application bundle.
if (window.location.hostname.endsWith(".workers.dev")) {
  void navigator.serviceWorker?.getRegistrations().then(registrations => {
    for (const registration of registrations) void registration.unregister();
  });
  void caches?.keys().then(keys => {
    for (const key of keys) void caches.delete(key);
  });
} else if ("serviceWorker" in navigator && window.isSecureContext) {
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
  if (error.message !== UNAUTHED_ERR_MSG) return;
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
        // Preview auto-login fallback: when the browser blocks iframe cookies
        // (Safari ITP / private browsing / WebView), forward the mirrored token.
        // The short-lived module cache avoids repeated sessionStorage reads while
        // preserving the regular OAuth cookie flow and server-side precedence.
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
