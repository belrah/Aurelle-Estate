import { test, expect } from "@playwright/test";
for (const width of [360, 768, 1024, 1440])
  test(`larger typography stays readable and fits at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const heroActions = await page.locator(".hero-actions").boundingBox(),
      heroBottom = await page.locator(".hero-bottom").boundingBox();
    expect(heroActions!.y + heroActions!.height).toBeLessThan(heroBottom!.y);
    if (width >= 1024) {
      const nav = page.getByRole("navigation", {
        name: "Main navigation",
        exact: true,
      });
      expect(
        await nav
          .locator("a")
          .first()
          .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
      ).toBeGreaterThanOrEqual(16);
      const b = await nav.boundingBox();
      expect(Math.abs(b!.x + b!.width / 2 - width / 2)).toBeLessThan(2);
    }
    await page.goto("/agents");
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page
        .locator("main p:not(.eyebrow)")
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeGreaterThanOrEqual(16);
    const footer = page.getByRole("contentinfo");
    expect(
      await footer
        .locator(".footer-grid a")
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeGreaterThanOrEqual(17);
    expect(
      await footer
        .locator(".footer-grid p")
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeGreaterThanOrEqual(17);
    await footer.scrollIntoViewIfNeeded();
    if (width === 360 || width === 1440)
      await page.screenshot({
        path: `test-results/typography-footer-${width}.png`,
        animations: "disabled",
      });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("switch", { name: "Dark mode", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(
      await footer
        .locator(".footer-grid a")
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeGreaterThanOrEqual(17);
  });
