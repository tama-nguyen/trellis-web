import type { ErrorMessageMap } from "@/shared/api/errors";
import { NotificationSummaryAudience } from "@/shared/api/generated/model/notificationSummaryAudience";
import { NotificationSummarySeverity } from "@/shared/api/generated/model/notificationSummarySeverity";
import { NotificationSummaryStatus } from "@/shared/api/generated/model/notificationSummaryStatus";

/** REST paths of the domain; the generated client builds the same URLs. The mock backend matches these. */
export const NOTIFICATION_API = {
  LIST: "/api/notifications",
  DETAIL: "/api/notifications/:notificationCode",
} as const;

/** Query-string names the list endpoint accepts besides the cursor (`first`, `after`). */
export const NOTIFICATION_QUERY = {
  SEARCH: "query",
  AUDIENCE: "audience",
} as const;

/** Enum values come from the OpenAPI contract (generated); never retype them. */
export const NOTIFICATION_SEVERITIES = NotificationSummarySeverity;
export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[keyof typeof NOTIFICATION_SEVERITIES];

/**
 * Who may read a published notification. STAFF notifications need `notification:read-staff`; anyone else gets 404,
 * not 403, so the UI cannot reveal they exist.
 */
export const NOTIFICATION_AUDIENCES = NotificationSummaryAudience;
export type NotificationAudience = (typeof NOTIFICATION_AUDIENCES)[keyof typeof NOTIFICATION_AUDIENCES];

/** Readers only ever see PUBLISHED; managers also see DRAFT and ARCHIVED. */
export const NOTIFICATION_STATUSES = NotificationSummaryStatus;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[keyof typeof NOTIFICATION_STATUSES];

/** Backend `NotificationErrorCode` values (REST `code`, GraphQL `extensions.errorCode`). */
export const NOTIFICATION_ERRORS = {
  NOT_FOUND: "NOTIFICATION_NOT_FOUND",
} as const;

export const NOTIFICATION_ERROR_MESSAGES: ErrorMessageMap = {
  [NOTIFICATION_ERRORS.NOT_FOUND]: "notification.errors.notFound",
};

export const NOTIFICATION_PAGE_SIZE = 10;
