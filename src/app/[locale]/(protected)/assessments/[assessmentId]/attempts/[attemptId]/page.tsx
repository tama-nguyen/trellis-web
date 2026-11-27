import { setRequestLocale } from "next-intl/server";
import { AssessmentResultPage } from "@/features/learning/assessment/AssessmentResultPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale; assessmentId: string; attemptId: string }> };

export default async function AssessmentResultRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <AssessmentResultPage />;
}
