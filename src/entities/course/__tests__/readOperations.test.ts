import { afterEach, expect, it, vi } from "vitest";
import { courseApi } from "../course.api";
import { noticeApi } from "@/entities/notice/notice.api";

afterEach(() => vi.unstubAllGlobals());

it("uses GET for the notice list and preserves its audience, search and cursor", async () => {
  const page = { items: [], hasNext: false };
  const fetch = vi.fn().mockResolvedValue(Response.json(page));
  vi.stubGlobal("fetch", fetch);

  expect(await noticeApi.list({ first: 2, audience: "STAFF", query: "hello" }, "cursor")).toEqual(page);
  const [url, init] = fetch.mock.calls.at(0) ?? [];
  const request = new URL(url, "http://localhost");
  expect(init.method).toBe("GET");
  expect(request.pathname).toBe("/api/notices");
  expect(Object.fromEntries(request.searchParams)).toEqual({
    first: "2",
    after: "cursor",
    audience: "STAFF",
    query: "hello",
  });
});

it("requests a filtered course page and preserves its continuation", async () => {
  const page = { items: [], nextCursor: "next", hasNext: true };
  const fetch = vi.fn().mockResolvedValue(Response.json(page));
  vi.stubGlobal("fetch", fetch);

  expect(await courseApi.list({ first: 1, after: "a+b", status: "ACTIVE", query: "lesson" })).toEqual(page);
  const [url, init] = fetch.mock.calls.at(0) ?? [];
  const request = new URL(url, "http://localhost");
  expect(init.method).toBe("GET");
  expect(request.pathname).toBe("/api/courses");
  expect(Object.fromEntries(request.searchParams)).toEqual({
    first: "1",
    after: "a+b",
    status: "ACTIVE",
    query: "lesson",
  });
});

it("preserves the missing-resource status and correlation ID on course detail", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue(
      Response.json({ status: 404, detail: "Missing", correlationId: "trace" }, { status: 404 }),
    );
  vi.stubGlobal("fetch", fetch);
  await expect(courseApi.detail("hidden")).rejects.toMatchObject({ status: 404, correlationId: "trace" });
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining("/api/courses/hidden"),
    expect.objectContaining({ method: "GET" }),
  );
});
