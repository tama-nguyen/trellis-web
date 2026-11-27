import { AUTH_ROUTES } from "@/shared/constants/routes/auth.routes";
import { createLocalizedMetadata } from "@/i18n/metadata";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { RegisterForm } from "@/features/auth/forms/RegisterForm";
import { PageShell } from "@/ui/layout/PageShell";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };
export const generateMetadata = createLocalizedMetadata("auth.register.title", { robots: { index: false } });
export default async function Page({ params }: PageProps) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("auth");
  return (
    <PageShell title={t("register.title")}>
      <section className="max-w-md">
        <Suspense fallback={<Skeleton className="h-48" />}>
          <RegisterForm />
        </Suspense>
        <Link href={AUTH_ROUTES.login}>{t("login.title")}</Link>
      </section>
    </PageShell>
  );
}
