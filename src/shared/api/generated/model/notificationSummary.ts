/**
 * GENERATED from the Trellis API contracts by the backend toolchain. DO NOT EDIT. Replaced by the @trellis/contracts package (decision T22); see scripts/check-contracts.mjs.
 */
import type { NotificationSummaryAudience } from './notificationSummaryAudience';
import type { NotificationSummarySeverity } from './notificationSummarySeverity';
import type { NotificationSummaryStatus } from './notificationSummaryStatus';

export interface NotificationSummary {
  audience: NotificationSummaryAudience;
  code: string;
  createdAt: string;
  publishedAt?: string;
  severity: NotificationSummarySeverity;
  status: NotificationSummaryStatus;
  title: string;
}
