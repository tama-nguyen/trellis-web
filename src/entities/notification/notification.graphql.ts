import { graphql } from "@/shared/graphql/generated/gql";

/** Notification detail composes the notification and publication statistics in one read. */
export const NotificationDetailDocument = graphql(`
  query NotificationDetail($code: ID!) {
    notification(code: $code) {
      code
      title
      body
      severity
      audience
      status
      publishedAt
      stats {
        publishCount
        lastPublishedAt
      }
    }
  }
`);
