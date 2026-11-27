import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { CourseDirectory } from "@/features/learning/catalog/BackendCoursePages";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.catalog.title");

export default async function CatalogRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <CourseDirectory />;
}
