"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { notificationApi } from "./notification.api";
import type { NotificationListParams } from "./notification.types";

/** Query keys for the notification domain; invalidate `notificationKeys.all` after any notification mutation. */
export const notificationKeys = {
  all: ["notification"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params: NotificationListParams) => [...notificationKeys.lists(), params] as const,
  details: () => [...notificationKeys.all, "detail"] as const,
  detail: (notificationCode: string) => [...notificationKeys.details(), notificationCode] as const,
};

/** Keyset pages: `fetchNextPage()` appends the next page; there is no page number to jump to. */
export function useNotifications(params: NotificationListParams) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(params),
    queryFn: ({ signal, pageParam }) => notificationApi.list(params, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
  });
}

export function useNotification(notificationCode: string) {
  return useQuery({
    queryKey: notificationKeys.detail(notificationCode),
    queryFn: ({ signal }) => notificationApi.detail(notificationCode, signal),
  });
}
