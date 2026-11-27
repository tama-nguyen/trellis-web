import { test, expect } from "../../fixtures/base-test";
import { TEST_USERS } from "../../data/users";

test("public catalog and identity pages remain accessible anonymously", async ({ page }) => {
  for (const path of [
    "/courses",
    "/catalog/courses/example",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ]) {
    await page.goto(`/en${path}`);
    await expect(page).toHaveURL(`/en${path}`);
  }
});

test("all protected areas preserve deep links when redirecting anonymous users", async ({ page }) => {
  const privateCourseRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/courses")) {
      privateCourseRequests.push(request.url());
    }
  });
  for (const locale of ["en", "vi", "zh"]) {
    for (const path of [
      "/learn",
      "/learn/catalog/example",
      "/studio/courses/new",
      "/account",
      "/admin",
      "/assessments/example/start",
      "/search",
    ]) {
      await page.goto(`/${locale}${path}?source=deep-link`);
      await expect(page).toHaveURL(new RegExp(`/${locale}/login\\?`));
      expect(new URL(page.url()).searchParams.get("redirect")).toBe(`${path}?source=deep-link`);
    }
  }
  expect(privateCourseRequests).toEqual([]);
});

test("login restores a deep link and the shared guard observes logout", async ({ page }) => {
  await page.goto("/en/learn?source=deep-link");
  await expect(page).toHaveURL(/\/en\/login\?/);
  await page.getByLabel(/^Email/).fill(TEST_USERS.member.email);
  await page.getByLabel(/^Password/).fill(TEST_USERS.member.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("/en/learn?source=deep-link");
  await page.reload();
  await expect(page.locator("main")).toBeVisible();
  await page.goto("/en/studio");
  await expect(page.locator("main")).toBeVisible();
  await page.goto("/en/admin");
  await expect(page.getByText("You do not have access here", { exact: true })).toBeVisible();
  await page.goto("/en/account");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/login\?/);
});
