import { setRequestLocale } from "next-intl/server";
import { AssessmentPage } from "@/features/learning/assessment/AssessmentPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale; assessmentId: string }> };

export default async function AssessmentRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <AssessmentPage />;
}
