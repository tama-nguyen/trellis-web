"use client";

import { Search, Users } from "@/ui/icons/lucide";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  NOTIFICATION_AUDIENCES,
  NOTIFICATION_PAGE_SIZE,
} from "@/entities/notification/notification.constants";
import { useNotifications } from "@/entities/notification/notification.queries";
import { Link } from "@/i18n/navigation";
import { getApiErrorMessage } from "@/shared/api/errors";
import { ROUTES } from "@/shared/constants/routes";
import { useDebouncedCallback } from "@/shared/hooks/useDebouncedCallback";
import { useFeatureFlag } from "@/shared/hooks/useFeatureFlag";
import { EventType, track } from "@/shared/lib/analytics";
import { formatDate } from "@/shared/lib/format";
import { screenStateOf } from "@/shared/lib/screenState";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { ErrorState } from "@/ui/feedback/ErrorState";
import { Icon } from "@astryxdesign/core/Icon";
import { TextInput } from "@astryxdesign/core/TextInput";
import { PageShell } from "@/ui/layout/PageShell";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { NotificationSeverityBadge } from "../components/NotificationSeverityBadge";

const SEARCH_INPUT_TYPE = "search";

function NotificationListSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {Array.from({ length: NOTIFICATION_PAGE_SIZE }, (_, index) => (
        <li key={index}>
          <Skeleton className="h-16 w-full rounded-card" />
        </li>
      ))}
    </ul>
  );
}

/**
 * Sample feature: a keyset-paged, searchable list. Shows the full pipeline (component -> entity
 * hook -> entity api -> generated client -> http), "load more" over cursor pages, a feature flag,
 * debouncing, analytics and the five screen states.
 */
export function NotificationListPage() {
  const t = useTranslations("notification.list");
  const tAll = useTranslations();
  const locale = useLocale();
  const searchEnabled = useFeatureFlag("notificationSearch");

  // The input updates on every keystroke; only the request is debounced.
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const applySearch = useDebouncedCallback((value: string) => {
    // A new search is a new query key, so the infinite query starts again from the first page.
    setQuery(value.trim());
    track({ type: EventType.NotificationSearched, queryLength: value.trim().length });
  });

  const notifications = useNotifications({ first: NOTIFICATION_PAGE_SIZE, query: query || undefined });
  const items = notifications.data?.pages.flatMap((page) => page.items);
  const state = screenStateOf(notifications, { isEmpty: items?.length === 0 });

  return (
    <PageShell
      title={t("title")}
      description={t("description")}
      actions={
        searchEnabled ? (
          <TextInput
            label={t("searchLabel")}
            isLabelHidden
            type={SEARCH_INPUT_TYPE}
            startIcon={Search}
            value={searchInput}
            placeholder={t("searchPlaceholder")}
            width="18rem"
            onChange={(next) => {
              setSearchInput(next);
              applySearch(next);
            }}
          />
        ) : null
      }
      state={state}
      loading={<NotificationListSkeleton />}
      empty={
        <EmptyState
          title={query ? t("emptySearchTitle") : t("emptyTitle")}
          description={query ? t("emptySearchDescription") : t("emptyDescription")}
        />
      }
      error={
        <ErrorState
          title={t("errorTitle")}
          description={getApiErrorMessage(notifications.error, tAll)}
          retryLabel={tAll("common.actions.retry")}
          onRetry={() => void notifications.refetch()}
        />
      }
    >
      {items ? (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-3">
            {items.map((notification) => (
              <li key={notification.code}>
                <Link
                  href={ROUTES.notificationDetail(notification.code)}
                  onClick={() =>
                    track({ type: EventType.NotificationOpened, notificationCode: notification.code })
                  }
                  className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4 transition-colors hover:bg-surface-hover sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {notification.audience === NOTIFICATION_AUDIENCES.STAFF ? (
                      <Icon icon={Users} size="sm" className="text-fg-subtle" label={t("staffLabel")} />
                    ) : null}
                    <span className="truncate font-medium text-fg">{notification.title}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3 text-sm text-fg-muted">
                    <NotificationSeverityBadge severity={notification.severity} />
                    {notification.publishedAt ? (
                      <time dateTime={notification.publishedAt}>
                        {formatDate(notification.publishedAt, locale)}
                      </time>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex justify-center">
            {notifications.hasNextPage ? (
              <Button
                variant="secondary"
                size="sm"
                isLoading={notifications.isFetchingNextPage}
                onClick={() => void notifications.fetchNextPage()}
                label={t("loadMore")}
              />
            ) : (
              <p className="text-sm text-fg-muted">{t("endOfList")}</p>
            )}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
