import { type NextRequest } from "next/server";
import { backendOrigin } from "@/shared/api/backend";
import { HTTP_HEADERS, HTTP_STATUS, MEDIA_TYPES } from "@/shared/constants/http";
import type { ApiErrorBody } from "@/shared/types/api.types";

/**
 * Same-origin proxy (BFF): the browser calls `/api/...` on this host and the request is forwarded
 * to the backend origin read at runtime from TRELLIS_BACKEND_URL. This keeps the backend URL out
 * of the client bundle and out of CORS. More specific routes (`/api/health`) take precedence.
 *
 * With the in-browser mock on, mocked domains never reach this handler.
 */
export const dynamic = "force-dynamic";

const API_PREFIX = "/api";
const PROXY_TIMEOUT_MS = 30_000;
const BAD_GATEWAY = 502;

/** Wire codes for failures that happen in the proxy itself, not in the backend. */
const PROXY_ERRORS = {
  NOT_CONFIGURED: "WEB_PROXY_NOT_CONFIGURED",
  UNREACHABLE: "WEB_PROXY_UNREACHABLE",
} as const;

/**
 * Hop-by-hop headers (RFC 9110 §7.6.1) plus ones fetch recomputes. `content-encoding` is dropped
 * on the way back because Node's fetch has already decompressed the body.
 */
const REQUEST_HEADERS_DROPPED = [
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "content-length",
  HTTP_HEADERS.INTERNAL_KEY.toLowerCase(),
  HTTP_HEADERS.USER_ID.toLowerCase(),
];
const RESPONSE_HEADERS_DROPPED = [
  "connection",
  "keep-alive",
  "transfer-encoding",
  "content-encoding",
  "content-length",
  HTTP_HEADERS.INTERNAL_KEY.toLowerCase(),
  HTTP_HEADERS.USER_ID.toLowerCase(),
];

function problem(status: number, code: string, detail: string, instance: string): Response {
  const body: ApiErrorBody = { status, code, detail, instance };
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      [HTTP_HEADERS.CONTENT_TYPE]: MEDIA_TYPES.PROBLEM_JSON,
      [HTTP_HEADERS.CACHE_CONTROL]: "no-store",
    },
  });
}

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const instance = `${API_PREFIX}/${path.join("/")}`;
  const origin = backendOrigin();
  if (!origin) {
    return problem(
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      PROXY_ERRORS.NOT_CONFIGURED,
      "Backend not configured.",
      instance,
    );
  }

  // Re-encode each segment so a crafted path cannot climb out of /api on the backend.
  const target = new URL(`${API_PREFIX}/${path.map(encodeURIComponent).join("/")}`, origin);
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  for (const name of REQUEST_HEADERS_DROPPED) headers.delete(name);
  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      // Required by Node's fetch to stream a request body.
      ...(hasBody ? { duplex: "half" } : {}),
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(PROXY_TIMEOUT_MS),
    } as RequestInit);
  } catch {
    return problem(BAD_GATEWAY, PROXY_ERRORS.UNREACHABLE, "Backend unreachable.", instance);
  }

  const responseHeaders = new Headers(upstream.headers);
  for (const name of RESPONSE_HEADERS_DROPPED) responseHeaders.delete(name);
  responseHeaders.set(HTTP_HEADERS.CACHE_CONTROL, "no-store");
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export { proxy as DELETE, proxy as GET, proxy as PATCH, proxy as POST, proxy as PUT };
