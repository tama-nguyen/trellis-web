"use client";

import { useTranslations } from "next-intl";
import { AUTH_ERROR_MESSAGES } from "@/entities/auth/auth.constants";
import { getApiErrorMessage } from "@/shared/api/errors";

export function AuthActionResult({
  error,
  succeeded,
  successMessage,
}: {
  error: unknown;
  succeeded: boolean;
  successMessage: string;
}) {
  const t = useTranslations();
  if (error) return <p role="alert">{getApiErrorMessage(error, t, { codeMessages: AUTH_ERROR_MESSAGES })}</p>;
  if (succeeded) return <p role="status">{successMessage}</p>;
  return null;
}
