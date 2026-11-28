/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type NotificationAudience =
  | 'ALL'
  | 'STAFF';

export type NotificationSeverity =
  | 'CRITICAL'
  | 'INFO'
  | 'WARNING';

export type NotificationStatus =
  | 'ARCHIVED'
  | 'DRAFT'
  | 'PUBLISHED';

export type NotificationDetailQueryVariables = Exact<{
  code: string | number;
}>;


export type NotificationDetailQuery = { notification: { code: string, title: string, body: string, severity: NotificationSeverity, audience: NotificationAudience, status: NotificationStatus, publishedAt: string | null, stats: { publishCount: number, lastPublishedAt: string | null } } | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const NotificationDetailDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<NotificationDetailQuery, NotificationDetailQueryVariables>;