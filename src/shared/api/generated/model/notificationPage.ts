/**
 * GENERATED from the Trellis API contracts by the backend toolchain. DO NOT EDIT. Replaced by the @trellis/contracts package (decision T22); see scripts/check-contracts.mjs.
 */
import type { NotificationSummary } from './notificationSummary';

export interface NotificationPage {
  hasNext: boolean;
  items: NotificationSummary[];
  nextCursor?: string;
}
