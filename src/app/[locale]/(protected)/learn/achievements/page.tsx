import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { AchievementsPage } from "@/features/learning/learner/AchievementsPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.achievementsPage.title");

export default async function AchievementsRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <AchievementsPage />;
}
