import { setRequestLocale } from "next-intl/server";
import { AssessmentAuthorPage } from "@/features/learning/studio/AssessmentAuthorPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale; assessmentId: string }> };

export default async function AssessmentAuthorRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <AssessmentAuthorPage />;
}
