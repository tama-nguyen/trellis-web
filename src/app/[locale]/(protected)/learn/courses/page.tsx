import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { MyCoursesPage } from "@/features/learning/learner/MyCoursesPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.myCourses.title");

export default async function MyCoursesRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <MyCoursesPage />;
}
