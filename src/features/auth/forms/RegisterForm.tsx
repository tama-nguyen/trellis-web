"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";
import { authApi } from "@/entities/auth/auth.api";
import { AuthActionResult } from "./AuthActionResult";

export function RegisterForm() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const registration = useMutation({ mutationFn: authApi.register });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    registration.mutate({ email: email.trim(), displayName: displayName.trim(), password });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <TextInput
        label={t("fields.displayName")}
        value={displayName}
        onChange={setDisplayName}
        autoComplete="name"
        isRequired
      />
      <TextInput
        label={t("login.email")}
        value={email}
        onChange={setEmail}
        autoComplete="email"
        type="email"
        isRequired
      />
      <TextInput
        label={t("login.password")}
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        type="password"
        isRequired
      />
      <Button
        type="submit"
        variant="primary"
        label={t("register.submit")}
        isLoading={registration.isPending}
        isDisabled={registration.isSuccess}
      />
      <AuthActionResult
        error={registration.error}
        succeeded={registration.isSuccess}
        successMessage={t("register.success")}
      />
    </form>
  );
}
