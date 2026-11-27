import type { ErrorMessageMap } from "@/shared/api/errors";

export const AUTH_API = {
  LOGIN: "/api/auth/login",
  REFRESH: "/api/auth/refresh",
  LOGOUT: "/api/auth/logout",
  ME: "/api/auth/me",
} as const;

/**
 * Wire codes of auth failures (problem `code`, SCREAMING_SNAKE like the backend's `ErrorCode`s).
 * Branch on these, never on a literal.
 *
 * UNAUTHENTICATED and ACCESS_DENIED are the backend's `PlatformErrorCode`s. The rest are mock/BFF
 * only until a real auth endpoint exists: the backend is a resource server and answers every
 * token problem with UNAUTHENTICATED; login and refresh happen at the identity provider.
 */
export const AUTH_ERRORS = {
  /** Missing or invalid bearer token (backend). */
  UNAUTHENTICATED: "UNAUTHENTICATED",
  /** Authenticated but lacking the permission (backend). */
  ACCESS_DENIED: "ACCESS_DENIED",
  /** Mock only: wrong email or password at the mock login endpoint. */
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  /** Mock only: the access token expired; the client refreshes and retries. */
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  /** Mock only: the refresh token is unknown or revoked; the session ends. */
  REFRESH_TOKEN_INVALID: "REFRESH_TOKEN_INVALID",
} as const;
export type AuthErrorCode = (typeof AUTH_ERRORS)[keyof typeof AUTH_ERRORS];

/**
 * A 401 with one of these means "the access token is stale, refresh and retry". Any other
 * 401 (bad credentials, revoked refresh token) ends the attempt.
 */
export const REFRESHABLE_AUTH_CODES: readonly string[] = [AUTH_ERRORS.TOKEN_EXPIRED];

export const AUTH_ERROR_MESSAGES: ErrorMessageMap = {
  [AUTH_ERRORS.INVALID_CREDENTIALS]: "auth.errors.invalidCredentials",
};

/**
 * Flat permission codes, exactly as the backend's `@PermissionCatalog` classes declare them
 * (`resource:action`); the backend resolves them on every request. The admin area is about
 * managing notifications, so it is gated by `notification:manage` (no web-only permissions).
 */
export const PERMISSIONS = {
  NOTIFICATION_READ: "notification:read",
  NOTIFICATION_READ_STAFF: "notification:read-staff",
  NOTIFICATION_MANAGE: "notification:manage",
} as const;
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
