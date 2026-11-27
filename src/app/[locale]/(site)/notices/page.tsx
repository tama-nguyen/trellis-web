import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { NoticeListPage } from "@/features/notice/pages/NoticeListPage";
import type { Locale } from "@/i18n/routing";

type NoticesPageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("notice.list.title");

export default async function NoticesPage({ params }: NoticesPageProps) {
  setRequestLocale((await params).locale);
  return (
    <Suspense>
      <NoticeListPage />
    </Suspense>
  );
}
