import { expect, test } from "@playwright/test";

test("keeps browser bearer authentication independent from internal delegation", async ({ request }) => {
  const proxied = await request.get("/api/auth/me", {
    headers: { "X-Internal-Key": "forged-key", "X-User-Id": "forged-user" },
  });
  expect(proxied.status()).toBe(401);
  expect(proxied.headers()["x-internal-key"]).toBeUndefined();
  expect(proxied.headers()["x-user-id"]).toBeUndefined();
  expect(proxied.headers()["cache-control"]).toBe("no-store");
  const page = await request.get("/en/login");
  const headers = page.headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("no-referrer");
  expect(headers["permissions-policy"]).toContain("camera=()");
});
