import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { ResourceLibraryPage } from "@/features/learning/learner/ResourceLibraryPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.resourcesPage.title");

export default async function ResourcesRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <ResourceLibraryPage />;
}
