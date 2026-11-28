import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { HomePage } from "@/features/home/pages/HomePage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("home.meta.title");

export default async function HomeRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <HomePage />;
}
