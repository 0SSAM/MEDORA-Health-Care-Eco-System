import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { resetIdentityBoundClientState } from "@/lib/identitySessionBoundary";
import { useQueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";

export const AUTH_CHECK_TIMEOUT_MS = 1_500;

const isCloudflarePreview = () =>
  typeof window !== "undefined" &&
  window.location.hostname === "medora-preview.hossam-naeim2002.workers.dev";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const isPreview = isCloudflarePreview();
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  // Cloudflare preview is intentionally a static frontend preview. It has no
  // backend Worker/API binding, so never let an auth request block rendering.
  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: !isPreview,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const [authCheckTimedOut, setAuthCheckTimedOut] = useState(false);

  useEffect(() => {
    if (isPreview || !meQuery.isLoading) {
      setAuthCheckTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAuthCheckTimedOut(true);
    }, AUTH_CHECK_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isPreview, meQuery.isLoading]);

  const internalLogoutMutation = trpc.auth.internalLogout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    if (isPreview) return;
    try {
      await internalLogoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (!(error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED")) {
        throw error;
      }
    }
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED") return;
      throw error;
    } finally {
      try {
        sessionStorage.removeItem("manus-cookie");
      } catch {}
      resetIdentityBoundClientState(queryClient);
      utils.auth.me.setData(undefined, null);
    }
  }, [isPreview, internalLogoutMutation, logoutMutation, queryClient, utils]);

  const state = useMemo(() => {
    const user = isPreview ? null : meQuery.data ?? null;
    if (typeof window !== "undefined") {
      localStorage.setItem("manus-runtime-user-info", JSON.stringify(user));
    }
    return {
      user,
      loading: isPreview
        ? false
        : (meQuery.isLoading && !authCheckTimedOut) || internalLogoutMutation.isPending || logoutMutation.isPending,
      error: isPreview ? null : meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(user),
    };
  }, [
    isPreview,
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    authCheckTimedOut,
    logoutMutation.error,
    internalLogoutMutation.isPending,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (isPreview || !redirectOnUnauthenticated) return;
    if ((meQuery.isLoading && !authCheckTimedOut) || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;

    if (redirectPath) {
      window.location.href = redirectPath;
    } else {
      startLogin();
    }
  }, [
    isPreview,
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    authCheckTimedOut,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
