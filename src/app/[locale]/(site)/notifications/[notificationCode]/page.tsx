import { setRequestLocale } from "next-intl/server";
import { createLocalizedMetadata } from "@/i18n/metadata";
import { NotificationDetailPage } from "@/features/notification/pages/NotificationDetailPage";
import type { Locale } from "@/i18n/routing";

type NotificationDetailRouteProps = { params: Promise<{ locale: Locale; notificationCode: string }> };

export const generateMetadata = createLocalizedMetadata("notification.detail.title");

export default async function NotificationDetailRoute({ params }: NotificationDetailRouteProps) {
  const { locale, notificationCode } = await params;
  setRequestLocale(locale);
  return <NotificationDetailPage notificationCode={notificationCode} />;
}
