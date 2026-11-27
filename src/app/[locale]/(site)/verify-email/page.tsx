import { createLocalizedMetadata } from "@/i18n/metadata";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { VerifyEmailForm } from "@/features/auth/forms/VerifyEmailForm";
import { PageShell } from "@/ui/layout/PageShell";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/shared/constants/routes";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };
export const generateMetadata = createLocalizedMetadata("auth.verify.title", { robots: { index: false } });
export default async function Page({ params }: PageProps) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("auth");
  return (
    <PageShell title={t("verify.title")}>
      <section className="max-w-md">
        <Suspense fallback={<Skeleton className="h-48" />}>
          <VerifyEmailForm />
        </Suspense>
        <Link href={ROUTES.login}>{t("login.title")}</Link>
      </section>
    </PageShell>
  );
}
