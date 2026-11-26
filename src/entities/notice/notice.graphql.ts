import { graphql } from "@/shared/graphql/generated/gql";

/** Notice detail composes the notice and publication statistics in one read. */
export const NoticeDetailDocument = graphql(`
  query NoticeDetail($code: ID!) {
    notice(code: $code) {
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
