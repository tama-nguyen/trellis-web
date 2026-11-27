import { setRequestLocale } from "next-intl/server";
import { PublishPreflightPage } from "@/features/learning/studio/PublishPreflightPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale; courseSlug: string }> };

export default async function PublishRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <PublishPreflightPage />;
}
