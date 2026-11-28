"use client";

import { useSyncExternalStore } from "react";
import { getQueryClient } from "@/shared/api/queryClient";
import { configureAuth } from "@/shared/api/http";
import { authApi } from "./auth.api";
import { REFRESHABLE_AUTH_CODES } from "./auth.constants";
import type { AuthTokens } from "./auth.types";

/**
 * The token half of auth state, and the only module that knows tokens are persisted, and where.
 * The user half is server state and lives in the React Query cache (`authKeys.me()`).
 *
 * Tokens in localStorage are readable by any script on the page. That is acceptable for the
 * template's mock backend only; with a real backend move the refresh token to an httpOnly
 * cookie (see AGENTS.md "Auth").
 */
const STORAGE_KEY = "trellis.session";

type SessionSnapshot = {
  tokens: AuthTokens | null;
  /** False until storage has been read in the browser, so guards do not redirect too early. */
  hydrated: boolean;
};

const SERVER_SNAPSHOT: SessionSnapshot = { tokens: null, hydrated: false };
let snapshot: SessionSnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function emit(next: SessionSnapshot): void {
  snapshot = next;
  for (const listener of listeners) listener();
}

function readStorage(): AuthTokens | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    return null;
  }
}

export function setTokens(tokens: AuthTokens | null): void {
  try {
    if (tokens) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked: the session lasts until the tab closes.
  }
  if (tokens === null) getQueryClient().removeQueries();
  emit({ tokens, hydrated: true });
}

export function getTokens(): AuthTokens | null {
  return snapshot.tokens;
}

if (typeof window !== "undefined") {
  snapshot = { tokens: readStorage(), hydrated: true };
  // Another tab signing in or out rewrites the same key.
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      getQueryClient().removeQueries();
      emit({ tokens: readStorage(), hydrated: true });
    }
  });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Current session. Server render and hydration see `hydrated: false`. */
export function useSession(): SessionSnapshot {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => SERVER_SNAPSHOT,
  );
}

configureAuth({
  getToken: () => snapshot.tokens?.accessToken ?? null,
  isRefreshable: (code) => REFRESHABLE_AUTH_CODES.includes(code),
  refresh: async () => {
    const refreshToken = snapshot.tokens?.refreshToken;
    if (!refreshToken) throw new Error("No refresh token");
    const tokens = await authApi.refresh(refreshToken);
    setTokens(tokens);
    return tokens.accessToken;
  },
  // Clearing the tokens is enough: RequireAuth sees the session end and sends the user to the
  // login page with a redirect back, and public pages simply render signed out.
  onSessionEnd: () => setTokens(null),
});
