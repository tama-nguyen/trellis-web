/** Sign-in and the signed-in account. */
export const AUTH_ROUTES = {
  register: "/register",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  login: "/login",
  account: "/account",
} as const;

/** Query parameter carrying the path to return to after sign-in. */
export const REDIRECT_PARAM = "redirect";
