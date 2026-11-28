import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { StudioAnalyticsPage } from "@/features/learning/studio/StudioAnalyticsPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.analyticsPage.title");

export default async function AnalyticsRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <StudioAnalyticsPage />;
}
