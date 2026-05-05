import { expect, test } from "@playwright/test";

test("landing page opens", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /План питания/ })).toBeVisible();
});
