/**
 * GENERATED from the Trellis API contracts by the backend toolchain. DO NOT EDIT. Replaced by the @trellis/contracts package (decision T22); see scripts/check-contracts.mjs.
 */
import type { NotificationViewAudience } from './notificationViewAudience';
import type { NotificationViewSeverity } from './notificationViewSeverity';
import type { NotificationViewStatus } from './notificationViewStatus';

export interface NotificationView {
  archivedAt?: string;
  audience: NotificationViewAudience;
  body: string;
  code: string;
  createdAt: string;
  publishedAt?: string;
  severity: NotificationViewSeverity;
  status: NotificationViewStatus;
  title: string;
  updatedAt: string;
  version: number;
}
