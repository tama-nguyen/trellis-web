/**
 * Fixed HTTP vocabulary shared by the client (`shared/api/http.ts`) and the mock backend,
 * which has to read and write the same headers and codes the real backend does.
 */
export const HTTP_HEADERS = {
  INTERNAL_KEY: "X-Internal-Key",
  USER_ID: "X-User-Id",
  CACHE_CONTROL: "Cache-Control",
  AUTHORIZATION: "Authorization",
  CONTENT_TYPE: "Content-Type",
  CONTENT_LENGTH: "Content-Length",
  ACCEPT_LANGUAGE: "Accept-Language",
  IDEMPOTENCY_KEY: "Idempotency-Key",
} as const;

export const MEDIA_TYPES = {
  JSON: "application/json",
  PROBLEM_JSON: "application/problem+json",
  /** Matches `application/json`, `application/problem+json` and any `; charset=` suffix. */
  JSON_SUBTYPE: "json",
} as const;

/** `Authorization: Bearer <token>`: the prefix, including its space. */
export const BEARER_PREFIX = "Bearer ";

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const;
export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

/**
 * RFC 7807 `type` URIs the client branches on. Only VALIDATION matters to the UI: it is the
 * one problem whose `detail` is written for the user and safe to show verbatim.
 */
export const PROBLEM_TYPES = {
  VALIDATION: "urn:trellis:problem:validation",
} as const;
