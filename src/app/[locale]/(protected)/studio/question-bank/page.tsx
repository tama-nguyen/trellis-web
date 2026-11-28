import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { QuestionBankPage } from "@/features/learning/studio/QuestionBankPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.studio.questionBank.title");

export default async function QuestionBankRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <QuestionBankPage />;
}
