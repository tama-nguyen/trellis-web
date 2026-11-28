import { setRequestLocale } from "next-intl/server";
import { AssessmentStartPage } from "@/features/learning/assessment/AssessmentStartPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale; assessmentId: string }> };

export default async function AssessmentStartRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <AssessmentStartPage />;
}
