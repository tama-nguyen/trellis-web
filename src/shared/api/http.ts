import { ApiError, NETWORK_ERROR_STATUS } from "@/shared/api/apiError";
import { backendOrigin } from "@/shared/api/backend";
import {
  BEARER_PREFIX,
  HTTP_HEADERS,
  HTTP_METHODS,
  HTTP_STATUS,
  MEDIA_TYPES,
  type HttpMethod,
} from "@/shared/constants/http";
import { buildUrl, type PathParams, type QueryParams } from "@/shared/lib/url";
import type { ApiErrorBody } from "@/shared/types/api.types";

/**
 * The HTTP client: the only module allowed to call `fetch` (lint rule local/no-raw-fetch).
 * It attaches the bearer token, runs a single-flight refresh on a stale-token 401, parses
 * the body and throws `ApiError`. Entities wrap it in typed functions (`<domain>.api.ts`).
 */

/**
 * In the browser, requests stay same-origin (`/api/...`) and reach the backend through the proxy
 * route; on the server (Server Components, route handlers) they go straight to the backend origin
 * read at runtime. No backend URL is baked into the build.
 */
function baseUrl(): string {
  return typeof window === "undefined" ? (backendOrigin() ?? "") : "";
}

/**
 * What the client needs from the auth domain. Asked of an adapter rather than decided here:
 * `shared/` must not import `entities/`, and a copy of the auth error codes kept in this file
 * is a copy nothing checks against the real backend.
 */
export type AuthAdapter = {
  /** Current access token, or null when signed out. */
  getToken: () => string | null;
  /** Whether a 401 with this error code means "token is stale" rather than "you may not". */
  isRefreshable: (code: string) => boolean;
  /** Rotate the token pair and return the new access token; throw if impossible. */
  refresh: () => Promise<string>;
  /** Called once when a refresh fails for good: drop the session and send the user to sign in. */
  onSessionEnd: () => void;
};

let auth: AuthAdapter | null = null;

/** Wires the auth domain into the client. Called once, from `entities/auth/auth.session.ts`. */
export function configureAuth(adapter: AuthAdapter): void {
  auth = adapter;
}

export type RequestOptions = {
  /** Interpolated into `:name` placeholders in the url. Never string-concat a URL. */
  pathParams?: PathParams;
  /** Serialized to a query string; undefined/null/"" entries are dropped. */
  params?: QueryParams;
  /** Pass React Query's `signal` so a cancelled query aborts in flight. */
  signal?: AbortSignal;
  /** Skip the Authorization header and the refresh: login, register, refresh itself. */
  anonymous?: boolean;
  headers?: Record<string, string>;
  /** Next.js fetch extensions; only meaningful when called from a Server Component. */
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
};

type FullRequest = RequestOptions & {
  method: HttpMethod;
  url: string;
  body?: unknown;
};

async function parseBody(response: Response): Promise<unknown> {
  if (
    response.status === HTTP_STATUS.NO_CONTENT ||
    response.headers.get(HTTP_HEADERS.CONTENT_LENGTH) === "0"
  ) {
    return undefined;
  }
  const contentType = response.headers.get(HTTP_HEADERS.CONTENT_TYPE) ?? "";
  if (!contentType.includes(MEDIA_TYPES.JSON_SUBTYPE)) return response.text();
  try {
    return await response.json();
  } catch {
    // A body that claims JSON but is not (a proxy error page) is not worth crashing over.
    return undefined;
  }
}

function asErrorBody(body: unknown): ApiErrorBody | undefined {
  return typeof body === "object" && body !== null ? (body as ApiErrorBody) : undefined;
}

function toApiError(response: Response, body: unknown): ApiError {
  const errorBody = asErrorBody(body);
  return new ApiError(
    errorBody?.detail ?? errorBody?.title ?? `Request failed with status ${response.status}`,
    response.status,
    errorBody,
  );
}

const isFormData = (body: unknown): body is FormData =>
  typeof FormData !== "undefined" && body instanceof FormData;

/**
 * A `FormData` body goes through untouched: `fetch` writes its own
 * `multipart/form-data; boundary=...` header, and a hand-set Content-Type (or
 * `JSON.stringify`, which turns it into `{}`) breaks the upload. A `FormData` can be sent
 * twice, so the refresh replay below works for uploads as well.
 */
async function send(req: FullRequest, token: string | null): Promise<Response> {
  const form = isFormData(req.body);
  const headers: Record<string, string> = {
    ...(req.body === undefined || form ? {} : { [HTTP_HEADERS.CONTENT_TYPE]: MEDIA_TYPES.JSON }),
    ...(token ? { [HTTP_HEADERS.AUTHORIZATION]: `${BEARER_PREFIX}${token}` } : {}),
    ...req.headers,
  };
  let body: BodyInit | undefined;
  if (req.body !== undefined) body = form ? (req.body as FormData) : JSON.stringify(req.body);

  try {
    return await fetch(buildUrl(baseUrl(), req.url, req.pathParams, req.params), {
      method: req.method,
      signal: req.signal,
      cache: req.cache,
      next: req.next,
      headers,
      body,
    });
  } catch (cause) {
    // An abort is the caller's decision (React Query cancelling); let it through unchanged.
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new ApiError("Network request failed", NETWORK_ERROR_STATUS);
  }
}

let refreshInFlight: Promise<string> | null = null;

/** Concurrent 401s await the same refresh, then replay with the token it returns. */
function refreshOnce(adapter: AuthAdapter): Promise<string> {
  refreshInFlight ??= adapter.refresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

export async function request<T>(req: FullRequest): Promise<T> {
  const adapter = req.anonymous || !auth?.getToken() ? null : auth;
  let response = await send(req, adapter?.getToken() ?? null);
  if (response.ok) return (await parseBody(response)) as T;

  const body = await parseBody(response);
  const code = asErrorBody(body)?.code ?? "";
  if (!adapter || response.status !== HTTP_STATUS.UNAUTHORIZED || !adapter.isRefreshable(code)) {
    throw toApiError(response, body);
  }

  let freshToken: string;
  try {
    freshToken = await refreshOnce(adapter);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === HTTP_STATUS.UNAUTHORIZED || error.status === HTTP_STATUS.FORBIDDEN)
    ) {
      adapter.onSessionEnd();
    }
    throw error;
  }

  response = await send(req, freshToken);
  if (!response.ok) throw toApiError(response, await parseBody(response));
  return (await parseBody(response)) as T;
}

export const get = <T>(url: string, opts: RequestOptions = {}): Promise<T> =>
  request<T>({ method: HTTP_METHODS.GET, url, ...opts });

export const post = <T>(url: string, body?: unknown, opts: RequestOptions = {}): Promise<T> =>
  request<T>({ method: HTTP_METHODS.POST, url, body, ...opts });

export const put = <T>(url: string, body?: unknown, opts: RequestOptions = {}): Promise<T> =>
  request<T>({ method: HTTP_METHODS.PUT, url, body, ...opts });

export const patch = <T>(url: string, body?: unknown, opts: RequestOptions = {}): Promise<T> =>
  request<T>({ method: HTTP_METHODS.PATCH, url, body, ...opts });

export const del = <T>(url: string, opts: RequestOptions = {}): Promise<T> =>
  request<T>({ method: HTTP_METHODS.DELETE, url, ...opts });
