import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { NotificationListPage } from "@/features/notification/pages/NotificationListPage";
import type { Locale } from "@/i18n/routing";

type NotificationsPageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: NotificationsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "notification.list" });
  return { title: t("title") };
}

export default async function NotificationsPage({ params }: NotificationsPageProps) {
  setRequestLocale((await params).locale);
  return (
    <Suspense>
      <NotificationListPage />
    </Suspense>
  );
}
