import { test, expect } from "@playwright/test";

test.use({ trace: "off", screenshot: "off", video: "off" });
const mailpit = process.env.E2E_MAILPIT_URL;

test("native registration, verification, login, recovery and session revocation", async ({
  page,
  request,
}) => {
  test.skip(!mailpit, "Start isolated backend and Mailpit, then set E2E_MAILPIT_URL.");
  test.setTimeout(120_000);
  const email = `learner-${crypto.randomUUID()}@example.test`;
  const password = "Native-test-password-123!";
  const newPassword = "Replacement-test-password-456!";
  const name = "Native integration learner";

  async function deliveredMessage(subject: string) {
    let messageId: string | undefined;
    await expect
      .poll(
        async () => {
          const messages = await (await request.get(`${mailpit}/api/v1/messages`)).json();
          messageId = messages.messages.find(
            (message: { To: { Address: string }[]; Subject: string; ID: string }) =>
              message.Subject === subject && message.To.some((recipient) => recipient.Address === email),
          )?.ID;
          return Boolean(messageId);
        },
        { timeout: 25_000 },
      )
      .toBe(true);
    return (await (await request.get(`${mailpit}/api/v1/message/${messageId}`)).json()).Text as string;
  }

  await page.goto("/en/register");
  await page.getByLabel(/^Display name(?: ∙ Required)?$/).fill(name);
  await page.getByLabel(/^Email(?: ∙ Required)?$/).fill(email);
  await page.getByLabel(/^Password(?: ∙ Required)?$/).fill(password);
  await page.getByRole("button", { name: "Register", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Check your email" })).toBeVisible();

  const verificationMail = await deliveredMessage("Verify your Trellis email");
  const verificationUrl = verificationMail.match(/https?:\/\/\S+/)?.[0];
  if (!verificationUrl) throw new Error("Verification email did not contain a link");
  const verifyToken = new URL(verificationUrl).searchParams.get("token");
  const pending = await request.post("/api/auth/login", { data: { email, password } });
  expect(pending.status()).toBe(403);
  expect((await pending.json()).code).toBe("EMAIL_NOT_VERIFIED");

  await page.goto(verificationUrl);
  await expect(page.getByRole("button", { name: "Verify email", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Verify email", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Your email is verified" })).toBeVisible();
  expect(new URL(page.url()).searchParams.has("token")).toBe(false);
  const reused = await request.post("/api/auth/verify-email", { data: { token: verifyToken } });
  expect(reused.status()).toBe(400);

  await page.getByRole("link", { name: "Sign in", exact: true }).last().click();
  await expect(page).toHaveURL(/\/en\/login/);
  await page.getByLabel(/^Email(?: ∙ Required)?$/).fill(email);
  await page.getByLabel(/^Password(?: ∙ Required)?$/).fill(password);
  const loginResponse = page.waitForResponse((response) => response.url().endsWith("/api/auth/login"));
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  expect((await loginResponse).status()).toBe(200);
  await expect(page).toHaveURL(/\/en\/account/);
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await expect(page.getByText(name, { exact: true }).first()).toBeVisible();

  // Invalidate the browser's access credential while retaining its genuine refresh credential.
  await page.evaluate(() => {
    const stored = JSON.parse(localStorage.getItem("trellis.session") ?? "{}");
    stored.accessToken = stored.accessToken.slice(0, -1) + (stored.accessToken.endsWith("x") ? "y" : "x");
    localStorage.setItem("trellis.session", JSON.stringify(stored));
  });
  const refreshResponse = page.waitForResponse((response) => response.url().endsWith("/api/auth/refresh"));
  await page.reload();
  expect((await refreshResponse).status()).toBe(200);
  await expect(page.getByText(email, { exact: true })).toBeVisible();

  const beforeReset = await page.evaluate(() => JSON.parse(localStorage.getItem("trellis.session") ?? "{}"));
  const activeSession = await request.get("/api/auth/me", {
    headers: { Authorization: `Bearer ${beforeReset.accessToken}` },
  });
  expect(activeSession.status()).toBe(200);

  await page.goto("/en/forgot-password");
  await page.getByLabel(/^Email(?: ∙ Required)?$/).fill(email);
  await page.getByRole("button", { name: "Send reset code", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "If this account is eligible" })).toBeVisible();
  const resetMail = await deliveredMessage("Reset your Trellis password");
  const code = resetMail.split("Your password reset code is: ")[1]?.trim();
  if (!code) throw new Error("Reset email did not contain a code");
  await page.getByRole("link", { name: "Reset password", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/reset-password/);
  await page.getByLabel(/^Email(?: ∙ Required)?$/).fill(email);
  await page.getByLabel(/^Email code(?: ∙ Required)?$/).fill(code);
  await page.getByLabel(/^New password(?: ∙ Required)?$/).fill(newPassword);
  const resetRequest = page.waitForRequest((request) => request.url().endsWith("/api/auth/reset-password"));
  const resetResponse = page.waitForResponse((response) =>
    response.url().endsWith("/api/auth/reset-password"),
  );
  await page.getByRole("button", { name: "Reset password", exact: true }).click();
  const sentReset = (await resetRequest).postDataJSON();
  expect(sentReset.email === email).toBe(true);
  expect(sentReset.code === code).toBe(true);
  expect(sentReset.newPassword === newPassword).toBe(true);
  expect((await resetResponse).status()).toBe(204);
  await expect(page.getByRole("status").filter({ hasText: "Your password has been reset" })).toBeVisible();

  const revoked = await request.get("/api/auth/me", {
    headers: { Authorization: `Bearer ${beforeReset.accessToken}` },
  });
  expect(revoked.status()).toBe(401);
  const revokedRefresh = await request.post("/api/auth/refresh", {
    data: { refreshToken: beforeReset.refreshToken },
  });
  expect(revokedRefresh.status()).toBe(401);
  const oldPassword = await request.post("/api/auth/login", { data: { email, password } });
  expect(oldPassword.status()).toBe(401);
  const reusedCode = await request.post("/api/auth/reset-password", { data: { email, code, newPassword } });
  expect(reusedCode.status()).toBe(400);

  await page.getByRole("link", { name: "Sign in", exact: true }).last().click();
  await expect(page).toHaveURL(/\/en\/login/);
  await page.getByLabel(/^Email(?: ∙ Required)?$/).fill(email);
  await page.getByLabel(/^Password(?: ∙ Required)?$/).fill(newPassword);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/account/);
  await expect(page.getByText(email, { exact: true })).toBeVisible();

  const currentTokens = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("trellis.session") ?? "{}"),
  );
  const logout = page.waitForResponse((response) => response.url().endsWith("/api/auth/logout"));
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  expect((await logout).status()).toBe(204);
  const logoutRevoked = await request.get("/api/auth/me", {
    headers: { Authorization: `Bearer ${currentTokens.accessToken}` },
  });
  expect(logoutRevoked.status()).toBe(401);
  await page.goto("/en/account");
  await expect(page).toHaveURL(/\/en\/login/);
});
