import { setRequestLocale } from "next-intl/server";
import { CourseDraftForm } from "@/features/learning/studio/CourseDraftForm";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export default async function NewCourseRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <CourseDraftForm />;
}
