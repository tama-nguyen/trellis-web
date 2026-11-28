import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { StudentsPage } from "@/features/learning/studio/StudentsPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.studentsPage.title");

export default async function StudentsRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <StudentsPage />;
}
