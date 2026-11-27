import {
  NOTIFICATION_AUDIENCES,
  NOTIFICATION_SEVERITIES,
  NOTIFICATION_STATUSES,
} from "@/entities/notification/notification.constants";
import type { NotificationView } from "@/shared/api/generated/model/notificationView";

/**
 * A notification as the backend stores it: the generated REST view plus its author, which is server state
 * and never crosses the wire, and its publication count (the `notification_stats` read model).
 */
export type StoredNotification = NotificationView & { authorId: string; publishCount: number };

const SAMPLE_TOPICS = [
  "Scheduled maintenance window",
  "New study materials available",
  "Holiday timetable",
  "Updated terms of use",
  "Mobile app release",
  "Exam registration opens",
  "Library hours extended",
  "Password policy change",
  "Community event this weekend",
  "Survey: help us improve",
  "Service restored",
  "Course catalogue refreshed",
] as const;

const SEVERITY_CYCLE = [
  NOTIFICATION_SEVERITIES.INFO,
  NOTIFICATION_SEVERITIES.INFO,
  NOTIFICATION_SEVERITIES.WARNING,
  NOTIFICATION_SEVERITIES.CRITICAL,
];
const DAY_MS = 24 * 3600 * 1000;
/** Fixed origin so the seed is the same on every load. */
const SEED_EPOCH = Date.UTC(2026, 10, 1, 9, 0, 0);
/** Valid reference codes (Crockford base32: S, E, D, T, A, F are all in the alphabet). */
const SEED_CODE_PREFIX = "NT-SEED-0000-";
const SEED_AUTHOR = "u-admin";

const isoDaysBefore = (days: number) => new Date(SEED_EPOCH - days * DAY_MS).toISOString();

export const SEED_NOTIFICATIONS: readonly StoredNotification[] = [
  ...SAMPLE_TOPICS.flatMap((topic, index) =>
    [0, 1].map((round): StoredNotification => {
      const number = index * 2 + round + 1;
      const at = isoDaysBefore(number);
      return {
        code: `${SEED_CODE_PREFIX}${String(number).padStart(4, "0")}`,
        title: round === 0 ? topic : `${topic} (follow-up)`,
        body: `${topic}. This is sample notification number ${number}, used to show the list, detail and paging states.`,
        severity: SEVERITY_CYCLE[number % SEVERITY_CYCLE.length] ?? NOTIFICATION_SEVERITIES.INFO,
        audience: NOTIFICATION_AUDIENCES.ALL,
        status: NOTIFICATION_STATUSES.PUBLISHED,
        version: 2,
        createdAt: at,
        updatedAt: at,
        publishedAt: at,
        authorId: SEED_AUTHOR,
        publishCount: 1,
      };
    }),
  ),
  {
    code: "NT-SEED-STAF-0001",
    title: "Staff briefing: next quarter roadmap",
    body: "Addressed to staff. Readers without notification:read-staff get 404, exactly like a missing notification.",
    severity: NOTIFICATION_SEVERITIES.INFO,
    audience: NOTIFICATION_AUDIENCES.STAFF,
    status: NOTIFICATION_STATUSES.PUBLISHED,
    version: 2,
    createdAt: new Date(SEED_EPOCH).toISOString(),
    updatedAt: new Date(SEED_EPOCH).toISOString(),
    publishedAt: new Date(SEED_EPOCH).toISOString(),
    authorId: SEED_AUTHOR,
    publishCount: 2,
  },
];
