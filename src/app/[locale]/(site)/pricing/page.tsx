import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { PricingPage } from "@/features/marketing/pages/PricingPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("marketing.pricing.meta.title");

export default async function PricingRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <PricingPage />;
}
