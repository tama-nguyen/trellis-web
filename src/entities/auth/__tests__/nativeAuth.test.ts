import { afterEach, expect, it, vi } from "vitest";
import { authApi } from "../auth.api";
import { AUTH_API } from "../auth.constants";
import { configureAuth, get } from "@/shared/api/http";
import { ApiError } from "@/shared/api/apiError";

afterEach(() => {
  vi.unstubAllGlobals();
  configureAuth({
    getToken: () => null,
    isRefreshable: () => false,
    refresh: async () => "",
    onSessionEnd: () => {},
  });
});

it("sends the email code and new password to reset without a bearer", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetch);
  const payload = { email: "learner@example.test", code: "mailed-code", newPassword: "new-password" };

  await authApi.resetPassword(payload);

  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining(AUTH_API.RESET_PASSWORD),
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );
  const [, options] = fetch.mock.calls.at(0) ?? [];
  expect(options.headers.Authorization).toBeUndefined();
});

it("shares one refresh between concurrent native unauthorized reads", async () => {
  const refresh = vi.fn(async () => "fresh-access");
  configureAuth({
    getToken: () => "expired-access",
    isRefreshable: (code) => code === "UNAUTHENTICATED",
    refresh,
    onSessionEnd: vi.fn(),
  });
  const fetch = vi.fn(async (_url: string, options: RequestInit) => {
    const headers = options.headers as Record<string, string>;
    return headers.Authorization === "Bearer fresh-access"
      ? Response.json({ id: "user" })
      : Response.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  });
  vi.stubGlobal("fetch", fetch);

  const results = await Promise.all([get("/api/auth/me"), get("/api/auth/me")]);

  expect(refresh).toHaveBeenCalledTimes(1);
  expect(results).toEqual([{ id: "user" }, { id: "user" }]);
});

it("retains the session when refresh fails because the backend is unavailable", async () => {
  const onSessionEnd = vi.fn();
  configureAuth({
    getToken: () => "expired-access",
    isRefreshable: () => true,
    refresh: async () => {
      throw new ApiError("Unavailable", 503);
    },
    onSessionEnd,
  });
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json({ code: "UNAUTHENTICATED" }, { status: 401 })),
  );

  await expect(get("/api/auth/me")).rejects.toMatchObject({ status: 503 });

  expect(onSessionEnd).not.toHaveBeenCalled();
});

it.each([401, 403])(
  "ends the session when refresh definitively rejects credentials with %i",
  async (status) => {
    const onSessionEnd = vi.fn();
    configureAuth({
      getToken: () => "expired-access",
      isRefreshable: () => true,
      refresh: async () => {
        throw new ApiError("Rejected", status);
      },
      onSessionEnd,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ code: "UNAUTHENTICATED" }, { status: 401 })),
    );

    await expect(get("/api/auth/me")).rejects.toMatchObject({ status });

    expect(onSessionEnd).toHaveBeenCalledTimes(1);
  },
);
