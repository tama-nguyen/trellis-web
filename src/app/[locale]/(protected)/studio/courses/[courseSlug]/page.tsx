import { setRequestLocale } from "next-intl/server";
import { CourseStudioPage } from "@/features/learning/studio/CourseStudioPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale; courseSlug: string }> };

export default async function CourseStudioRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <CourseStudioPage />;
}
