"use client";

import { ArrowLeft, SearchX } from "@/ui/icons/lucide";
import { useLocale, useTranslations } from "next-intl";
import { NOTIFICATION_ERROR_MESSAGES } from "@/entities/notification/notification.constants";
import { useNotification } from "@/entities/notification/notification.queries";
import { getApiErrorMessage } from "@/shared/api/errors";
import { NOTIFICATION_ROUTES } from "@/shared/constants/routes/notification.routes";
import { formatDateTime } from "@/shared/lib/format";
import { screenStateOf } from "@/shared/lib/screenState";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { ErrorState } from "@/ui/feedback/ErrorState";
import { Icon } from "@astryxdesign/core/Icon";
import { PageShell } from "@/ui/layout/PageShell";
import { Prose } from "@/ui/primitives/Prose";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { NotificationSeverityBadge } from "../components/NotificationSeverityBadge";

/** Detail screen over the GraphQL read model (notification + publication stats in one request). */
export function NotificationDetailPage({ notificationCode }: { notificationCode: string }) {
  const t = useTranslations("notification.detail");
  const tAll = useTranslations();
  const locale = useLocale();
  const notification = useNotification(notificationCode);
  const backLink = (
    <Button
      variant="ghost"
      size="sm"
      icon={<Icon icon={ArrowLeft} size="sm" />}
      href={NOTIFICATION_ROUTES.notifications}
      label={t("back")}
    />
  );

  return (
    <PageShell
      actions={backLink}
      state={screenStateOf(notification)}
      loading={
        <div className="flex max-w-3xl flex-col gap-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-32 w-full rounded-card" />
        </div>
      }
      notFound={
        <EmptyState
          icon={<Icon icon={SearchX} size="lg" />}
          title={t("notFoundTitle")}
          description={t("notFoundDescription")}
          actions={backLink}
        />
      }
      error={
        <ErrorState
          title={t("errorTitle")}
          description={getApiErrorMessage(notification.error, tAll, {
            codeMessages: NOTIFICATION_ERROR_MESSAGES,
          })}
          retryLabel={tAll("common.actions.retry")}
          onRetry={() => void notification.refetch()}
        />
      }
    >
      {notification.data ? (
        <article className="flex max-w-3xl flex-col gap-4">
          <h1 className="text-2xl font-semibold text-fg">{notification.data.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-fg-muted">
            <NotificationSeverityBadge severity={notification.data.severity} />
            {notification.data.publishedAt ? (
              <time dateTime={notification.data.publishedAt}>
                {t("publishedAt", { date: formatDateTime(notification.data.publishedAt, locale) })}
              </time>
            ) : null}
            <span>{t("publishCount", { count: notification.data.stats.publishCount })}</span>
          </div>
          <Prose>
            <p className="whitespace-pre-line">{notification.data.body}</p>
          </Prose>
        </article>
      ) : null}
    </PageShell>
  );
}
