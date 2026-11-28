import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { StudyPlanPage } from "@/features/learning/learner/StudyPlanPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.studyPlanPage.title");

export default async function StudyPlanRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <StudyPlanPage />;
}
