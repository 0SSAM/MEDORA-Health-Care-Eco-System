// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { clearSessionAuthHeaderCache } from "@/lib/sessionAuth";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";

export const AUTH_CHECK_TIMEOUT_MS = 5_000;

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  // Login is started via startLogin() in the effect below, only when we actually
  // navigate — never during render. startLogin() mints a one-time nonce + writes
  // the state cookie, so calling it per render would overwrite the cookie and
  // desync it from an in-flight login's `state`.
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity, // The session state is handled by global redirect logic in main.tsx
  });
  const [authCheckTimedOut, setAuthCheckTimedOut] = useState(false);

  useEffect(() => {
    if (!meQuery.isLoading) {
      setAuthCheckTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      // A missing session must never leave the public login route blocked forever.
      // The server remains fail-closed; this only releases the UI from its spinner.
      setAuthCheckTimedOut(true);
    }, AUTH_CHECK_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [meQuery.isLoading]);

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
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      // Clear the Preview auto-login token mirrored into sessionStorage, so
      // header-based sessions (Safari ITP / WebView) are logged out too. The
      // backend cookie is cleared by the logout mutation.
      try {
        sessionStorage.removeItem("manus-cookie");
      } catch {}
      clearSessionAuthHeaderCache();
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [internalLogoutMutation, logoutMutation, utils]);

  const state = useMemo(() => ({
      user: meQuery.data ?? null,
      loading: (meQuery.isLoading && !authCheckTimedOut) || internalLogoutMutation.isPending || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
  }), [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    authCheckTimedOut,
    logoutMutation.error,
    internalLogoutMutation.isPending,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if ((meQuery.isLoading && !authCheckTimedOut) || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;

    // Navigate at this moment only. startLogin() mints the nonce + cookie itself.
    if (redirectPath) {
      window.location.href = redirectPath;
    } else {
      startLogin();
    }
  }, [
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
