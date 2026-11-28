import type { ErrorMessageMap } from "@/shared/api/errors";

export const AUTH_API = {
  REGISTER: "/api/auth/register",
  VERIFY_EMAIL: "/api/auth/verify-email",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
  LOGIN: "/api/auth/login",
  REFRESH: "/api/auth/refresh",
  LOGOUT: "/api/auth/logout",
  ME: "/api/auth/me",
} as const;

/** Native identity and platform problem codes; TOKEN_EXPIRED also supports explicit mock mode. */
export const AUTH_ERRORS = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  ACCESS_DENIED: "ACCESS_DENIED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  REFRESH_TOKEN_INVALID: "REFRESH_TOKEN_INVALID",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  USER_DISABLED: "USER_DISABLED",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  ACTION_TOKEN_INVALID: "ACTION_TOKEN_INVALID",
} as const;
export type AuthErrorCode = (typeof AUTH_ERRORS)[keyof typeof AUTH_ERRORS];

/**
 * A 401 with one of these means "the access token is stale, refresh and retry". Any other
 * 401 (bad credentials, revoked refresh token) ends the attempt.
 */
export const REFRESHABLE_AUTH_CODES: readonly string[] = [
  AUTH_ERRORS.TOKEN_EXPIRED,
  AUTH_ERRORS.UNAUTHENTICATED,
];

export const AUTH_ERROR_MESSAGES: ErrorMessageMap = {
  [AUTH_ERRORS.INVALID_CREDENTIALS]: "auth.errors.invalidCredentials",
  [AUTH_ERRORS.EMAIL_NOT_VERIFIED]: "auth.errors.emailNotVerified",
  [AUTH_ERRORS.USER_DISABLED]: "auth.errors.userDisabled",
  [AUTH_ERRORS.USER_ALREADY_EXISTS]: "auth.errors.userAlreadyExists",
  [AUTH_ERRORS.ACTION_TOKEN_INVALID]: "auth.errors.actionTokenInvalid",
  [AUTH_ERRORS.REFRESH_TOKEN_INVALID]: "auth.errors.sessionExpired",
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
