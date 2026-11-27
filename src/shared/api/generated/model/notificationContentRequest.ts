/**
 * GENERATED from the Trellis API contracts by the backend toolchain. DO NOT EDIT. Replaced by the @trellis/contracts package (decision T22); see scripts/check-contracts.mjs.
 */
import type { NotificationContentRequestAudience } from './notificationContentRequestAudience';
import type { NotificationContentRequestSeverity } from './notificationContentRequestSeverity';

export interface NotificationContentRequest {
  audience: NotificationContentRequestAudience;
  body: string;
  severity: NotificationContentRequestSeverity;
  title: string;
}
