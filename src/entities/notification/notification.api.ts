import { listNotifications } from "@/shared/api/generated/notification";
import { executeGraphql } from "@/shared/graphql/executeGraphql";
import { NotificationDetailDocument } from "./notification.graphql";
import type { NotificationDetail, NotificationListParams } from "./notification.types";
import { NOTIFICATION_ERRORS } from "./notification.constants";
import { ApiError } from "@/shared/api/apiError";
import { HTTP_STATUS } from "@/shared/constants/http";

/**
 * Thin wrappers over the generated clients: the REST list (generated from OpenAPI) and the GraphQL
 * detail read model. No caching, no UI.
 */
export const notificationApi = {
  list: (
    { first, query, audience }: NotificationListParams,
    after: string | undefined,
    signal?: AbortSignal,
  ) => listNotifications({ first, after, query, audience }, { signal }),

  detail: async (notificationCode: string, signal?: AbortSignal): Promise<NotificationDetail> => {
    const { notification } = await executeGraphql(
      NotificationDetailDocument,
      { code: notificationCode },
      signal,
    );
    // The backend reports a hidden or missing notification as a NOT_FOUND error; a bare null means the same.
    if (!notification) {
      throw new ApiError("Notification not found", HTTP_STATUS.NOT_FOUND, {
        status: HTTP_STATUS.NOT_FOUND,
        code: NOTIFICATION_ERRORS.NOT_FOUND,
      });
    }
    return notification;
  },
};
