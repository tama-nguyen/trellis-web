import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { SearchResultsPage } from "@/features/learning/learner/SearchResultsPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.searchPage.title");

export default async function SearchRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <SearchResultsPage />;
}
