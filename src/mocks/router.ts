import { HTTP_HEADERS, HTTP_STATUS, MEDIA_TYPES, type HttpMethod } from "@/shared/constants/http";
import { randomId } from "@/shared/lib/id";
import type { ApiErrorBody, Page } from "@/shared/types/api.types";

/**
 * A tiny mock backend installed over `globalThis.fetch`.
 *
 * Why not MSW: it intercepts through a Service Worker, which needs a registered script, a
 * secure context and a browser that allows one; when any of that fails the app has no backend
 * at all. Every request already goes through the single `fetch` call in `shared/api/http.ts`,
 * so wrapping that one function is smaller and harder to break.
 */

export type MockContext = {
  params: Record<string, string>;
  query: URLSearchParams;
  request: Request;
  path: string;
};
export type MockHandler = (context: MockContext) => Promise<Response> | Response;

export type MockRoute = {
  method: HttpMethod;
  /** Path with `:name` placeholders, e.g. "/api/notifications/:notificationCode". */
  pattern: string;
  handler: MockHandler;
};

const MOCK_CORRELATION_PREFIX = "mock-";
const PATH_PARAM_PREFIX = ":";
/** Latency, so loading states are visible rather than theoretical. */
const DEFAULT_LATENCY_MS = 250;

export function json(body: unknown, status: number = HTTP_STATUS.OK): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { [HTTP_HEADERS.CONTENT_TYPE]: MEDIA_TYPES.JSON },
  });
}

export function noContent(): Response {
  return new Response(null, { status: HTTP_STATUS.NO_CONTENT });
}

/** The backend's error contract, so `ApiError.code` behaves exactly as in production. */
export function problem(path: string, status: number, code: string, detail: string, type?: string): Response {
  const body: ApiErrorBody = {
    type,
    status,
    detail,
    instance: path,
    code,
    correlationId: randomId(MOCK_CORRELATION_PREFIX).slice(0, MOCK_CORRELATION_PREFIX.length + 8),
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: { [HTTP_HEADERS.CONTENT_TYPE]: MEDIA_TYPES.PROBLEM_JSON },
  });
}

/** One page of `items`, built the way the server builds it: 0-based page, server-computed hasNext. */
export function pageOf<T, R = T>(
  items: readonly T[],
  page: number,
  size: number,
  view: (item: T) => R = (item) => item as unknown as R,
): Page<R> {
  const totalPages = size <= 0 ? 0 : Math.ceil(items.length / size);
  return {
    content: items.slice(page * size, page * size + size).map(view),
    page,
    size,
    totalElements: items.length,
    totalPages,
    hasNext: page + 1 < totalPages,
  };
}

function match(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (const [index, expected] of patternParts.entries()) {
    const actual = pathParts[index] ?? "";
    if (expected.startsWith(PATH_PARAM_PREFIX)) {
      params[expected.slice(PATH_PARAM_PREFIX.length)] = decodeURIComponent(actual);
    } else if (expected !== actual) {
      return null;
    }
  }
  return params;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function installMockFetch(routes: readonly MockRoute[], latencyMs = DEFAULT_LATENCY_MS): void {
  const realFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url, globalThis.location.origin);
    for (const route of routes) {
      if (route.method !== request.method) continue;
      const params = match(route.pattern, url.pathname);
      if (!params) continue;
      await delay(latencyMs);
      return route.handler({ params, query: url.searchParams, request, path: url.pathname });
    }
    // Anything the mock does not own (Next assets, HMR, unmocked domains) goes to the network.
    return realFetch(input, init);
  };
}
