import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { CatalogPage } from "@/features/marketing/pages/CatalogPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("marketing.catalog.meta.title");

export default async function CoursesRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <CatalogPage />;
}
