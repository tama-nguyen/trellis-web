import type { components } from "@/shared/api/generated/openapi";

export type AuthTokens = components["schemas"]["AuthTokens"];
export type AuthUser = components["schemas"]["AuthenticatedUser"];
export type LoginPayload = components["schemas"]["LoginRequest"];
export type RegisterPayload = components["schemas"]["RegisterRequest"];
export type ResetPasswordPayload = components["schemas"]["ResetPasswordRequest"];
