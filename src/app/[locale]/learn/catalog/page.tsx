import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CourseDirectory } from "@/features/learning/catalog/BackendCoursePages";
import { RequireAuth } from "@/features/auth/guards/RequireAuth";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "learning.catalog" });
  return { title: t("title") };
}

export default async function CatalogRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return (
    <RequireAuth>
      <CourseDirectory />
    </RequireAuth>
  );
}
