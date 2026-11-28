import { afterEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/[...path]/route";
import { HTTP_HEADERS } from "@/shared/constants/http";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("strips internal delegation headers at the browser proxy boundary", async () => {
  vi.stubEnv("TRELLIS_BACKEND_URL", "http://backend.example.test");
  const fetch = vi.fn().mockResolvedValue(
    Response.json(
      { enabled: true },
      {
        headers: { [HTTP_HEADERS.INTERNAL_KEY]: "upstream-key", [HTTP_HEADERS.USER_ID]: "upstream-user" },
      },
    ),
  );
  vi.stubGlobal("fetch", fetch);
  const request = new NextRequest("http://web.example.test/api/app-config", {
    headers: {
      [HTTP_HEADERS.INTERNAL_KEY]: "caller-key",
      [HTTP_HEADERS.USER_ID]: "caller-user",
      Authorization: "Bearer user-token",
    },
  });

  const response = await GET(request, { params: Promise.resolve({ path: ["app-config"] }) });

  const [, options] = fetch.mock.calls.at(0) ?? [];
  const forwarded = new Headers(options.headers);
  expect(forwarded.has(HTTP_HEADERS.INTERNAL_KEY)).toBe(false);
  expect(forwarded.has(HTTP_HEADERS.USER_ID)).toBe(false);
  expect(forwarded.get("Authorization")).toBe("Bearer user-token");
  expect(response.headers.has(HTTP_HEADERS.INTERNAL_KEY)).toBe(false);
  expect(response.headers.has(HTTP_HEADERS.USER_ID)).toBe(false);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
});
