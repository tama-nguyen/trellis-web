/**
 * GENERATED from the Trellis API contracts by the backend toolchain. DO NOT EDIT. Replaced by the @trellis/contracts package (decision T22); see scripts/check-contracts.mjs.
 */
import type {
  ListNotificationsParams
} from './model/listNotificationsParams';

import type {
  NotificationContentRequest
} from './model/notificationContentRequest';

import type {
  NotificationPage
} from './model/notificationPage';

import type {
  NotificationView
} from './model/notificationView';

import type {
  PublishNotificationHeaders
} from './model/publishNotificationHeaders';

import type {
  UpdateNotificationHeaders
} from './model/updateNotificationHeaders';

import { apiRequest } from '../apiRequest';



type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];


  export const listNotifications = (
    params?: ListNotificationsParams,
 options?: SecondParameter<typeof apiRequest<NotificationPage>>,) => {
      return apiRequest<NotificationPage>(
      {url: `/api/notifications`, method: 'GET',
        params
    },
      options);
    }
  export const createNotification = (
    notificationContentRequest: NotificationContentRequest,
 options?: SecondParameter<typeof apiRequest<NotificationView>>,) => {
      return apiRequest<NotificationView>(
      {url: `/api/notifications`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: notificationContentRequest
    },
      options);
    }
  export const getNotification = (
    code: string,
 options?: SecondParameter<typeof apiRequest<NotificationView>>,) => {
      return apiRequest<NotificationView>(
      {url: `/api/notifications/${code}`, method: 'GET'
    },
      options);
    }
  export const updateNotification = (
    code: string,
    notificationContentRequest: NotificationContentRequest,
    headers: UpdateNotificationHeaders,
 options?: SecondParameter<typeof apiRequest<NotificationView>>,) => {
      return apiRequest<NotificationView>(
      {url: `/api/notifications/${code}`, method: 'PUT',
      headers: {'Content-Type': 'application/json', ...headers},
      data: notificationContentRequest
    },
      options);
    }
  export const archiveNotification = (
    code: string,
 options?: SecondParameter<typeof apiRequest<NotificationView>>,) => {
      return apiRequest<NotificationView>(
      {url: `/api/notifications/${code}/archive`, method: 'POST'
    },
      options);
    }
  export const publishNotification = (
    code: string,
    headers?: PublishNotificationHeaders,
 options?: SecondParameter<typeof apiRequest<NotificationView>>,) => {
      return apiRequest<NotificationView>(
      {url: `/api/notifications/${code}/publish`, method: 'POST',
      headers
    },
      options);
    }
  export type ListNotificationsResult = NonNullable<Awaited<ReturnType<typeof listNotifications>>>
export type CreateNotificationResult = NonNullable<Awaited<ReturnType<typeof createNotification>>>
export type GetNotificationResult = NonNullable<Awaited<ReturnType<typeof getNotification>>>
export type UpdateNotificationResult = NonNullable<Awaited<ReturnType<typeof updateNotification>>>
export type ArchiveNotificationResult = NonNullable<Awaited<ReturnType<typeof archiveNotification>>>
export type PublishNotificationResult = NonNullable<Awaited<ReturnType<typeof publishNotification>>>
