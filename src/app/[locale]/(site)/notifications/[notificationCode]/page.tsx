import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NotificationDetailPage } from "@/features/notification/pages/NotificationDetailPage";
import type { Locale } from "@/i18n/routing";

type NotificationDetailRouteProps = { params: Promise<{ locale: Locale; notificationCode: string }> };

export async function generateMetadata({ params }: NotificationDetailRouteProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "notification.detail" });
  return { title: t("title") };
}

export default async function NotificationDetailRoute({ params }: NotificationDetailRouteProps) {
  const { locale, notificationCode } = await params;
  setRequestLocale(locale);
  return <NotificationDetailPage notificationCode={notificationCode} />;
}
