import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { LearningDashboardPage } from "@/features/learning/learner/LearningDashboardPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.dashboard.title");

export default async function LearnDashboardRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <LearningDashboardPage />;
}
