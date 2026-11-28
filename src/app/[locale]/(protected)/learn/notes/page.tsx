import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { NotesPage } from "@/features/learning/learner/NotesPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.notesPage.title");

export default async function NotesRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <NotesPage />;
}
