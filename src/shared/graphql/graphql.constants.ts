import { HTTP_STATUS } from "@/shared/constants/http";

/** The backend's GraphQL endpoint; under /api so the BFF proxy forwards it like REST. */
export const GRAPHQL_ENDPOINT = "/api/graphql";

/** `extensions.code` values the backend puts on GraphQL errors (`GraphQlErrorCode`). */
export const GRAPHQL_ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  UNAVAILABLE: "UNAVAILABLE",
  INTERNAL: "INTERNAL",
} as const;
export type GraphqlErrorCode = (typeof GRAPHQL_ERROR_CODES)[keyof typeof GRAPHQL_ERROR_CODES];

/**
 * The HTTP status each GraphQL code stands for, so `ApiError.status` (and with it `screenStateOf`,
 * the 404 screen, the status messages) behaves the same for REST and GraphQL.
 */
export const GRAPHQL_ERROR_STATUS: Record<GraphqlErrorCode, number> = {
  BAD_REQUEST: HTTP_STATUS.BAD_REQUEST,
  UNAUTHENTICATED: HTTP_STATUS.UNAUTHORIZED,
  FORBIDDEN: HTTP_STATUS.FORBIDDEN,
  NOT_FOUND: HTTP_STATUS.NOT_FOUND,
  CONFLICT: HTTP_STATUS.CONFLICT,
  RATE_LIMITED: HTTP_STATUS.TOO_MANY_REQUESTS,
  UNAVAILABLE: HTTP_STATUS.SERVICE_UNAVAILABLE,
  INTERNAL: HTTP_STATUS.INTERNAL_SERVER_ERROR,
};

/** Fields of `errors[].extensions` set by the backend's exception resolver. */
export type GraphqlErrorExtensions = {
  code?: string;
  /** The module's error code, e.g. NOTIFICATION_NOT_FOUND; the same value REST puts in `code`. */
  errorCode?: string;
  correlationId?: string;
  traceId?: string;
};

export type GraphqlError = {
  message: string;
  path?: readonly (string | number)[];
  extensions?: GraphqlErrorExtensions;
};

export type GraphqlResponse<TData> = {
  data?: TData | null;
  errors?: readonly GraphqlError[];
};
