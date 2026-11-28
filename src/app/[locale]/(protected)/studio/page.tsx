import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { StudioCoursesPage } from "@/features/learning/studio/StudioCoursesPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.studio.home.title");

export default async function StudioRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <StudioCoursesPage />;
}
