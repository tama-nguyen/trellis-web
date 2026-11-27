import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { GradingQueuePage } from "@/features/learning/studio/GradingQueuePage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.gradingPage.title");

export default async function GradingRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <GradingQueuePage />;
}
