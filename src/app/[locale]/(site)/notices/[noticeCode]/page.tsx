import { createLocalizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { NoticeDetailPage } from "@/features/notice/pages/NoticeDetailPage";
import type { Locale } from "@/i18n/routing";

type NoticeDetailRouteProps = { params: Promise<{ locale: Locale; noticeCode: string }> };

export const generateMetadata = createLocalizedMetadata("notice.detail.title");

export default async function NoticeDetailRoute({ params }: NoticeDetailRouteProps) {
  const { locale, noticeCode } = await params;
  setRequestLocale(locale);
  return <NoticeDetailPage noticeCode={noticeCode} />;
}
