"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { authApi } from "./auth.api";
import type { Permission } from "./auth.constants";
import { getTokens, setTokens, useSession } from "./auth.session";
import type { LoginPayload } from "./auth.types";

/** Query keys for the auth domain, all under one prefix so one call invalidates the domain. */
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

/** The signed-in user changes only through login/logout, which update this cache themselves. */
const ME_STALE_TIME_MS = 5 * 60_000;

export function useMe() {
  const { tokens, hydrated } = useSession();
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: ({ signal }) => authApi.me(signal),
    enabled: hydrated && tokens !== null,
    staleTime: ME_STALE_TIME_MS,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (tokens) => {
      await queryClient.cancelQueries();
      queryClient.removeQueries();
      setTokens(tokens);
      await queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const refreshToken = getTokens()?.refreshToken;
      if (refreshToken) await authApi.logout(refreshToken);
    },
    // Sign out locally even if the server call fails: the user asked to leave.
    onSettled: () => {
      setTokens(null);
      queryClient.removeQueries();
    },
  });
}

/**
 * `can(permission)` for the signed-in user. UI gating only: hiding a button is never
 * authorization; the backend checks every request.
 */
export function useCan(): { can: (permission: Permission) => boolean; isPending: boolean } {
  const me = useMe();
  const permissions = me.data?.permissions;
  const can = useCallback(
    (permission: Permission) => permissions?.includes(permission) ?? false,
    [permissions],
  );
  return { can, isPending: me.isPending };
}
