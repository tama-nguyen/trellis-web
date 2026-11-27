/** The sample notification screens. */
export const NOTIFICATION_ROUTES = {
  notifications: "/notifications",
  notificationDetail: (notificationCode: string) => `/notifications/${encodeURIComponent(notificationCode)}`,
} as const;
