"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";
import { authApi } from "@/entities/auth/auth.api";
import { AuthActionResult } from "./AuthActionResult";

export function VerifyEmailForm() {
  const t = useTranslations("auth");
  const params = useSearchParams();
  const [token, setToken] = useState(params.get("token") ?? "");
  const verification = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      setToken("");
      window.history.replaceState(null, "", window.location.pathname);
    },
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    verification.mutate(token.trim());
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {!verification.isSuccess && (
        <TextInput
          label={t("fields.verificationToken")}
          value={token}
          onChange={setToken}
          autoComplete="off"
          type="password"
          isRequired
        />
      )}
      <Button
        type="submit"
        variant="primary"
        label={t("verify.submit")}
        isLoading={verification.isPending}
        isDisabled={verification.isSuccess}
      />
      <AuthActionResult
        error={verification.error}
        succeeded={verification.isSuccess}
        successMessage={t("verify.success")}
      />
    </form>
  );
}
