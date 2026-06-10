import { expect, test } from "@playwright/test";

const smokeRoutes = [
  "/",
  "/archive?medium=Text&view=compact",
  "/search?q=harmala",
  "/archive/mead-lsd-memo",
];

for (const route of smokeRoutes) {
  test(`loads without horizontal page overflow: ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });

    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        clientWidth: root.clientWidth,
        scrollWidth: Math.max(root.scrollWidth, document.body.scrollWidth),
      };
    });

    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });
}

test("mobile navigation exposes nested sections", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile navigation is hidden on desktop.");

  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();

  const mobileNav = page.getByRole("navigation", { name: "Mobile primary" });
  await expect(mobileNav.getByRole("link", { name: "Search the archive" })).toBeVisible();

  await mobileNav.locator("summary").filter({ hasText: "Texts" }).click();
  await expect(mobileNav.getByRole("link", { name: "All texts" })).toBeVisible();
});

test("mobile archive filters open from the toolbar", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile filters are hidden on desktop.");

  await page.goto("/archive?medium=Text&view=compact", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Filters" }).click();

  const filterPanel = page.locator("#mobile-filters");
  await expect(filterPanel).toBeVisible();
  await filterPanel.getByText("Browse filters", { exact: true }).click();
  await expect(filterPanel.getByText("Category", { exact: true })).toBeVisible();
});
