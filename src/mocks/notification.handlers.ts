import { PERMISSIONS } from "@/entities/auth/auth.constants";
import {
  NOTIFICATION_API,
  NOTIFICATION_AUDIENCES,
  NOTIFICATION_ERRORS,
  NOTIFICATION_QUERY,
  NOTIFICATION_STATUSES,
} from "@/entities/notification/notification.constants";
import { NotificationDetailDocument } from "@/entities/notification/notification.graphql";
import type {
  NotificationDetail,
  NotificationPage,
  NotificationSummary,
} from "@/entities/notification/notification.types";
import { HTTP_METHODS, HTTP_STATUS } from "@/shared/constants/http";
import { CURSOR_QUERY } from "@/shared/constants/pagination";
import type {
  NotificationDetailQuery,
  NotificationDetailQueryVariables,
} from "@/shared/graphql/generated/graphql";
import {
  GRAPHQL_ENDPOINT,
  GRAPHQL_ERROR_CODES,
  type GraphqlResponse,
} from "@/shared/graphql/graphql.constants";
import type { SeedUser } from "./auth.seed";
import { guard } from "./guard";
import { SEED_NOTIFICATIONS, type StoredNotification } from "./notification.seed";
import { json, problem, type MockRoute } from "./router";

const DEFAULT_FIRST = 20;
const MAX_FIRST = 100;
/** Field of the GraphQL detail query, used as the error `path`. */
const NOTIFICATION_FIELD = "notification";

/**
 * The backend's visibility rule (`NotificationAccess`): managers see everything; others see PUBLISHED
 * notifications for ALL, plus STAFF ones with `notification:read-staff`; authors see their own. Anything else
 * answers 404 like a missing notification, so a 403 never confirms that it exists.
 */
function visibleTo(notification: StoredNotification, user: SeedUser): boolean {
  const can = (permission: string) => user.permissions.some((granted) => granted === permission);
  if (can(PERMISSIONS.NOTIFICATION_MANAGE) || notification.authorId === user.id) return true;
  return (
    notification.status === NOTIFICATION_STATUSES.PUBLISHED &&
    (notification.audience === NOTIFICATION_AUDIENCES.ALL || can(PERMISSIONS.NOTIFICATION_READ_STAFF))
  );
}

const toSummary = (notification: StoredNotification): NotificationSummary => ({
  code: notification.code,
  title: notification.title,
  severity: notification.severity,
  audience: notification.audience,
  status: notification.status,
  createdAt: notification.createdAt,
  publishedAt: notification.publishedAt,
});

const toDetail = (notification: StoredNotification): NotificationDetail => ({
  code: notification.code,
  title: notification.title,
  body: notification.body,
  severity: notification.severity,
  audience: notification.audience,
  status: notification.status,
  publishedAt: notification.publishedAt ?? null,
  stats: { publishCount: notification.publishCount, lastPublishedAt: notification.publishedAt ?? null },
});

/** Opaque to the client like the real HMAC cursor; here just the offset of the next row. */
const encodeCursor = (offset: number) => btoa(String(offset));
function decodeCursor(cursor: string | null): number {
  if (!cursor) return 0;
  const offset = Number.parseInt(atob(cursor), 10);
  return Number.isInteger(offset) && offset >= 0 ? offset : 0;
}

function firstParam(query: URLSearchParams): number {
  const value = Number.parseInt(query.get(CURSOR_QUERY.FIRST) ?? "", 10);
  return Number.isInteger(value) && value > 0 ? Math.min(value, MAX_FIRST) : DEFAULT_FIRST;
}

function findVisible(code: string | undefined, user: SeedUser): StoredNotification | undefined {
  const notification = SEED_NOTIFICATIONS.find((candidate) => candidate.code === code);
  return notification && visibleTo(notification, user) ? notification : undefined;
}

function graphqlNotFound(code: string): GraphqlResponse<NotificationDetailQuery> {
  return {
    data: { notification: null },
    errors: [
      {
        message: `Notification ${code} not found`,
        path: [NOTIFICATION_FIELD],
        extensions: { code: GRAPHQL_ERROR_CODES.NOT_FOUND, errorCode: NOTIFICATION_ERRORS.NOT_FOUND },
      },
    ],
  };
}

type GraphqlRequestBody = { query?: string; variables?: Partial<NotificationDetailQueryVariables> };

export const notificationRoutes: MockRoute[] = [
  {
    method: HTTP_METHODS.GET,
    pattern: NOTIFICATION_API.LIST,
    handler: ({ request, query, path }) => {
      const auth = guard(request, path, PERMISSIONS.NOTIFICATION_READ);
      if ("error" in auth) return auth.error;
      const search = query.get(NOTIFICATION_QUERY.SEARCH)?.trim().toLowerCase() ?? "";
      const audience = query.get(NOTIFICATION_QUERY.AUDIENCE);
      const matches = SEED_NOTIFICATIONS.filter(
        (notification) =>
          visibleTo(notification, auth.user) &&
          (!audience || notification.audience === audience) &&
          (!search || notification.title.toLowerCase().includes(search)),
      ).toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
      const offset = decodeCursor(query.get(CURSOR_QUERY.AFTER));
      const first = firstParam(query);
      const hasNext = offset + first < matches.length;
      const page: NotificationPage = {
        items: matches.slice(offset, offset + first).map(toSummary),
        hasNext,
        ...(hasNext ? { nextCursor: encodeCursor(offset + first) } : {}),
      };
      return json(page);
    },
  },
  {
    method: HTTP_METHODS.GET,
    pattern: NOTIFICATION_API.DETAIL,
    handler: ({ request, params, path }) => {
      const auth = guard(request, path, PERMISSIONS.NOTIFICATION_READ);
      if ("error" in auth) return auth.error;
      const notification = findVisible(params.notificationCode, auth.user);
      if (!notification) {
        return problem(path, HTTP_STATUS.NOT_FOUND, NOTIFICATION_ERRORS.NOT_FOUND, "Notification not found.");
      }
      const { authorId: _authorId, publishCount: _publishCount, ...view } = notification;
      return json(view);
    },
  },
  {
    // The mock GraphQL endpoint knows the notification detail document only; that is all the UI sends.
    method: HTTP_METHODS.POST,
    pattern: GRAPHQL_ENDPOINT,
    handler: async ({ request, path }) => {
      const auth = guard(request, path, PERMISSIONS.NOTIFICATION_READ);
      if ("error" in auth) return auth.error;
      const body = (await request.json()) as GraphqlRequestBody;
      if (body.query !== NotificationDetailDocument.toString()) {
        return json({
          errors: [
            { message: "Unknown operation (mock)", extensions: { code: GRAPHQL_ERROR_CODES.BAD_REQUEST } },
          ],
        });
      }
      const code = String(body.variables?.code ?? "");
      const notification = findVisible(code, auth.user);
      const response: GraphqlResponse<NotificationDetailQuery> = notification
        ? { data: { notification: toDetail(notification) } }
        : graphqlNotFound(code);
      return json(response);
    },
  },
];
