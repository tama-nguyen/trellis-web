"use client";

import { LogIn, LogOut } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PERMISSIONS } from "@/entities/auth/auth.constants";
import { useCan, useLogout, useMe } from "@/entities/auth/auth.queries";
import { useSession } from "@/entities/auth/auth.session";
import { ROUTES } from "@/shared/constants/routes";
import { EventType, track } from "@/shared/lib/analytics";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { Skeleton } from "@astryxdesign/core/Skeleton";

/** Header area: sign-in link when signed out; account, admin (if permitted) and sign-out when in. */
export function AuthMenu() {
  const t = useTranslations("common.nav");
  const tAuth = useTranslations("auth");
  const { tokens, hydrated } = useSession();
  const me = useMe();
  const { can } = useCan();
  const logout = useLogout();
  const router = useRouter();

  if (!hydrated) return <Skeleton className="h-8 w-24" />;
  if (!tokens) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={<Icon icon={LogIn} size="sm" />}
          href={ROUTES.login}
          label={t("signIn")}
        />
        <Button variant="primary" size="sm" href={ROUTES.register} label={tAuth("register.title")} />
      </div>
    );
  }

  const onLogout = () => {
    track({ type: EventType.LoggedOut });
    logout.mutate(undefined, { onSettled: () => router.replace(ROUTES.home) });
  };

  return (
    <div className="flex min-w-0 items-center gap-1">
      {can(PERMISSIONS.NOTICE_MANAGE) ? (
        <Button variant="ghost" size="sm" href={ROUTES.admin} label={t("admin")} />
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        href={ROUTES.account}
        className="max-w-28 sm:max-w-48"
        label={me.data?.displayName ?? t("account")}
      />
      <Button
        variant="ghost"
        size="sm"
        isIconOnly
        onClick={onLogout}
        isLoading={logout.isPending}
        icon={<Icon icon={LogOut} size="sm" />}
        label={t("signOut")}
      />
    </div>
  );
}
