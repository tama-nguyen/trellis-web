import { setRequestLocale } from "next-intl/server";
import { createLocalizedMetadata } from "@/i18n/metadata";
import { Suspense } from "react";
import { NotificationListPage } from "@/features/notification/pages/NotificationListPage";
import type { Locale } from "@/i18n/routing";

type NotificationsPageProps = { params: Promise<{ locale: Locale }> };

export const generateMetadata = createLocalizedMetadata("notification.list.title");

export default async function NotificationsPage({ params }: NotificationsPageProps) {
  setRequestLocale((await params).locale);
  return (
    <Suspense>
      <NotificationListPage />
    </Suspense>
  );
}
