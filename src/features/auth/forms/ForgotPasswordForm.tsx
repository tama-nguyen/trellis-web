"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";
import { authApi } from "@/entities/auth/auth.api";
import { ROUTES } from "@/shared/constants/routes";
import { Link } from "@/i18n/navigation";
import { AuthActionResult } from "./AuthActionResult";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const recovery = useMutation({ mutationFn: authApi.forgotPassword });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    recovery.mutate(email.trim());
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <TextInput
        label={t("login.email")}
        value={email}
        onChange={setEmail}
        autoComplete="email"
        type="email"
        isRequired
      />
      <Button type="submit" variant="primary" label={t("forgot.submit")} isLoading={recovery.isPending} />
      <AuthActionResult
        error={recovery.error}
        succeeded={recovery.isSuccess}
        successMessage={t("forgot.success")}
      />
      <Link href={ROUTES.resetPassword}>{t("reset.title")}</Link>
    </form>
  );
}
