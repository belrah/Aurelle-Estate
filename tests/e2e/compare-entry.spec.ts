import { test, expect } from "@playwright/test";
for (const width of [360, 768, 1024, 1440])
  test(`orange comparison entry belongs to the property categories at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/properties");
    await expect(
      page
        .getByRole("navigation", { name: "Main navigation", exact: true })
        .getByRole("link", { name: "Compare", exact: true }),
    ).toHaveCount(0);
    const row = page.locator(".listing-section > .category-tabs");
    const button = row.getByRole("link", {
      name: "Compare properties",
      exact: true,
    });
    await expect(button).toBeVisible();
    expect(
      await button.evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe("rgb(213, 91, 10)");
    expect(await button.evaluate((el) => getComputedStyle(el).color)).toBe(
      "rgb(255, 255, 255)",
    );
    expect(
      await button.evaluate((el) => el === el.parentElement?.lastElementChild),
    ).toBe(true);
    const box = await button.boundingBox(),
      rowBox = await row.boundingBox();
    expect(
      Math.abs(box!.x + box!.width - rowBox!.x - rowBox!.width),
    ).toBeLessThan(2);
    await row
      .getByRole("button", { name: "Land for Sale", exact: true })
      .click();
    await expect(page.locator(".property-card")).toHaveCount(2);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 360 || width === 1440)
      await page.screenshot({
        path: `test-results/compare-entry-${width}.png`,
        animations: "disabled",
      });
    await button.click();
    await expect(page).toHaveURL(/\/compare$/);
    await expect(page.locator("main h1")).toBeVisible();
  });
