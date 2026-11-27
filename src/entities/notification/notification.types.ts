import type { NotificationPage as NotificationPageDto } from "@/shared/api/generated/model/notificationPage";
import type { NotificationSummary as NotificationSummaryDto } from "@/shared/api/generated/model/notificationSummary";
import type { NotificationDetailQuery } from "@/shared/graphql/generated/graphql";
import type { NotificationAudience } from "./notification.constants";

/** A list row, exactly as the REST contract defines it (generated from contracts/openapi). */
export type NotificationSummary = NotificationSummaryDto;

/** One keyset page of the list. */
export type NotificationPage = NotificationPageDto;

/** The detail read model, exactly as the GraphQL document selects it (generated). */
export type NotificationDetail = NonNullable<NotificationDetailQuery["notification"]>;

/** List filters; the cursor is managed by the infinite query, not part of the key. */
export type NotificationListParams = {
  first: number;
  query?: string;
  audience?: NotificationAudience;
};
