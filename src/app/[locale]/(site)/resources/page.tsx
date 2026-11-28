import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { ResourcesPage } from "@/features/marketing/pages/ResourcesPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("marketing.resources.meta.title");

export default async function ResourcesRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <ResourcesPage />;
}
