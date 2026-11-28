import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { MessagesPage } from "@/features/learning/learner/MessagesPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.messagesPage.title");

export default async function MessagesRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <MessagesPage />;
}
