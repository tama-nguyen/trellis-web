"use client";

import { fieldError } from "@/shared/lib/formStatus";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { AUTH_ERROR_MESSAGES } from "@/entities/auth/auth.constants";
import { useLogin } from "@/entities/auth/auth.queries";
import { useRouter } from "@/i18n/navigation";
import { getApiErrorMessage } from "@/shared/api/errors";
import { AUTH_ROUTES, REDIRECT_PARAM } from "@/shared/constants/routes/auth.routes";
import { EventType, track } from "@/shared/lib/analytics";
import { safeRedirectPath } from "@/shared/lib/url";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";

const EMAIL_AUTOCOMPLETE = "username";
const PASSWORD_AUTOCOMPLETE = "current-password";

/** Uses `useSearchParams`: render inside `<Suspense>`. */
export function LoginForm() {
  const t = useTranslations("auth.login");
  const tAll = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showFieldErrors, setShowFieldErrors] = useState(false);

  // Derived during render, never synced into state with an effect.
  const emailError = showFieldErrors && !email.trim() ? t("emailRequired") : undefined;
  const passwordError = showFieldErrors && !password ? t("passwordRequired") : undefined;
  const submitError = login.error
    ? getApiErrorMessage(login.error, tAll, { codeMessages: AUTH_ERROR_MESSAGES })
    : undefined;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setShowFieldErrors(true);
      return;
    }
    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          track({ type: EventType.LoginSucceeded });
          router.replace(safeRedirectPath(searchParams.get(REDIRECT_PARAM)) ?? AUTH_ROUTES.account);
        },
      },
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <TextInput
        label={t("email")}
        type="email"
        autoComplete={EMAIL_AUTOCOMPLETE}
        size="lg"
        value={email}
        onChange={setEmail}
        status={fieldError(emailError)}
        statusVariant="detached"
      />
      <TextInput
        label={t("password")}
        type="password"
        autoComplete={PASSWORD_AUTOCOMPLETE}
        size="lg"
        value={password}
        onChange={setPassword}
        status={fieldError(passwordError)}
        statusVariant="detached"
      />
      {submitError ? (
        <p role="alert" className="rounded-control bg-danger-subtle px-3 py-2 text-sm text-danger">
          {submitError}
        </p>
      ) : null}
      <Button variant="primary" type="submit" size="lg" isLoading={login.isPending} label={t("submit")} />
    </form>
  );
}
