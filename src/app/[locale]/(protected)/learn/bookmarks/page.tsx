import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { BookmarksPage } from "@/features/learning/learner/BookmarksPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.bookmarksPage.title");

export default async function BookmarksRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <BookmarksPage />;
}
