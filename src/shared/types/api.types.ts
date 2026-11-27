// Cross-cutting HTTP shapes only. Domain types live in `entities/<domain>/` and are never
// re-exported from here (that would make shared depend on entities).

/** Paged response. `page` is 0-based; `hasNext` is computed by the server. */
export type Page<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

/** Query params every paged endpoint accepts. `sort` is "field,asc|desc". */
export type PageParams = {
  page?: number;
  size?: number;
  sort?: string;
};

export type FieldViolation = {
  field: string;
  message: string;
};

/**
 * Body of any non-2xx response: RFC 7807 problem details plus three extensions.
 * `code` is the backend's stable wire code (an `ErrorCode`, SCREAMING_SNAKE, e.g. `NOTIFICATION_NOT_FOUND`);
 * `correlationId` is the request id, shown to the user only on a 5xx for support.
 */
export type ApiErrorBody = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  code?: string;
  correlationId?: string;
  errors?: FieldViolation[];
};

/** ISO-8601 instant, e.g. "2026-08-04T12:00:00Z". */
export type IsoDateTime = string;

/**
 * Keyset page (every list endpoint of the real backend): pass `nextCursor` as `after` for the next
 * page; it is absent exactly when `hasNext` is false. There is no total and no page number.
 */
export type CursorPage<T> = {
  items: T[];
  nextCursor?: string;
  hasNext: boolean;
};
