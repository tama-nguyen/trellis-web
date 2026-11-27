import { setRequestLocale } from "next-intl/server";
import { CoursePlayerPage } from "@/features/learning/learner/CoursePlayerPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale; courseSlug: string }> };

/**
 * The mock renders one sample course whatever the slug: there is no learning endpoint yet, so the
 * route exists to make the links real rather than to look anything up.
 */
export default async function CoursePlayerRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <CoursePlayerPage />;
}
