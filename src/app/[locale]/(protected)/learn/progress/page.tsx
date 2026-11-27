import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { LearnerProgressPage } from "@/features/learning/learner/LearnerProgressPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.progressPage.title");

export default async function ProgressRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <LearnerProgressPage />;
}
