"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";
import { authApi } from "@/entities/auth/auth.api";
import { setTokens } from "@/entities/auth/auth.session";
import { AuthActionResult } from "./AuthActionResult";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const reset = useMutation({ mutationFn: authApi.resetPassword, onSuccess: () => setTokens(null) });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    reset.mutate({ email: email.trim(), code: code.trim(), newPassword });
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
      <TextInput
        label={t("fields.code")}
        value={code}
        onChange={setCode}
        autoComplete="one-time-code"
        isRequired
      />
      <TextInput
        label={t("fields.newPassword")}
        value={newPassword}
        onChange={setNewPassword}
        autoComplete="new-password"
        type="password"
        isRequired
      />
      <Button
        type="submit"
        variant="primary"
        label={t("reset.submit")}
        isLoading={reset.isPending}
        isDisabled={reset.isSuccess}
      />
      <AuthActionResult error={reset.error} succeeded={reset.isSuccess} successMessage={t("reset.success")} />
    </form>
  );
}
