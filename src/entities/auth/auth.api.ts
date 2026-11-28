import { get, post } from "@/shared/api/http";
import { AUTH_API } from "./auth.constants";
import type { AuthTokens, AuthUser, LoginPayload, RegisterPayload, ResetPasswordPayload } from "./auth.types";

/** Thin typed wrappers over `http`. No caching, no UI. */
export const authApi = {
  register: (payload: RegisterPayload) => post<undefined>(AUTH_API.REGISTER, payload, { anonymous: true }),
  verifyEmail: (token: string) => post<undefined>(AUTH_API.VERIFY_EMAIL, { token }, { anonymous: true }),
  forgotPassword: (email: string) =>
    post<undefined>(AUTH_API.FORGOT_PASSWORD, { email }, { anonymous: true }),
  resetPassword: (payload: ResetPasswordPayload) =>
    post<undefined>(AUTH_API.RESET_PASSWORD, payload, { anonymous: true }),
  login: (payload: LoginPayload) => post<AuthTokens>(AUTH_API.LOGIN, payload, { anonymous: true }),
  refresh: (refreshToken: string) =>
    post<AuthTokens>(AUTH_API.REFRESH, { refreshToken }, { anonymous: true }),
  logout: (refreshToken: string) => post<undefined>(AUTH_API.LOGOUT, { refreshToken }, { anonymous: true }),
  me: (signal?: AbortSignal) => get<AuthUser>(AUTH_API.ME, { signal }),
};
