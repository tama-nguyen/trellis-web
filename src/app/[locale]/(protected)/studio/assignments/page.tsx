import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { AssignmentsPage } from "@/features/learning/learner/AssignmentsPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.assignmentsPage.title");

export default async function AssignmentsRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <AssignmentsPage />;
}
