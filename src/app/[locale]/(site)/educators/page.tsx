import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { EducatorsPage } from "@/features/marketing/pages/EducatorsPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("marketing.educators.meta.title");

export default async function EducatorsRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <EducatorsPage />;
}
