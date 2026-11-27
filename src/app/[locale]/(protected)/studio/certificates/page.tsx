import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { CertificatesPage } from "@/features/learning/learner/CertificatesPage";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("learning.certificatesPage.title");

export default async function CertificatesRoute({ params }: PageProps) {
  setRequestLocale((await params).locale);
  return <CertificatesPage />;
}
