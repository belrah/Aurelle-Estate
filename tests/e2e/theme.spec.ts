import { test, expect } from "@playwright/test";
import { properties, articles } from "../../src/data";
const paths = [
  "/",
  "/properties",
  "/compare?items=epe-garden-plots,ibeju-lekki-sample-plot",
  "/about",
  "/mortgage",
  "/reed",
  "/contact",
  "/services",
  "/agents",
  "/agents/sign-up",
  "/agents/login",
  "/privacy",
  "/terms",
  ...properties.map((p) => `/properties/${p.slug}`),
  ...articles.map((a) => `/reed/${a.slug}`),
];

test("switch precedes Get Started, supports keyboard input, persists and synchronizes tabs", async ({
  page,
  context,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/properties");
  const toggle = page.getByRole("switch", { name: "Dark mode", exact: true });
  await expect(toggle).not.toBeChecked();
  expect(
    await page
      .getByRole("banner")
      .getByRole("link", { name: "Get Started", exact: true })
      .evaluate((el) => el.previousElementSibling?.getAttribute("role")),
  ).toBe("switch");
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(toggle).toBeChecked();
  const other = await context.newPage();
  await other.goto("/about");
  await expect(
    other.getByRole("switch", { name: "Dark mode", exact: true }),
  ).toBeChecked();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(other.locator("html")).toHaveAttribute("data-theme", "light");
  await other.close();
});

test("uses system preference until a visitor chooses a mode and works when storage is blocked", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(
    page.getByRole("switch", { name: "Dark mode", exact: true }),
  ).toBeChecked();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, "setItem", {
      value: () => {
        throw new Error("Storage unavailable");
      },
    });
  });
  await page.reload();
  await page.getByRole("switch", { name: "Dark mode", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

for (const width of [360, 768, 1024, 1440])
  test(`all pages support dark mode at ${width}px with centered desktop navigation`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: "dark" });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of paths) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("main h1")).toBeVisible();
      await expect(
        page.getByRole("switch", { name: "Dark mode", exact: true }),
      ).toBeChecked();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route,
      ).toBe(true);
      expect(
        await page
          .locator("html")
          .evaluate((el) => getComputedStyle(el).backgroundColor),
      ).toBe("rgb(11, 20, 30)");
    }
    await page.goto("/properties");
    if (width >= 1024) {
      const nav = await page
        .getByRole("navigation", { name: "Main navigation", exact: true })
        .boundingBox();
      expect(Math.abs(nav!.x + nav!.width / 2 - width / 2)).toBeLessThan(2);
    } else {
      await page
        .getByRole("button", { name: "Open navigation", exact: true })
        .click();
      await expect(
        page.getByRole("navigation", {
          name: "Mobile navigation",
          exact: true,
        }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
    }
    if (width === 360 || width === 1440)
      await page.screenshot({
        path: `test-results/dark-properties-${width}.png`,
        animations: "disabled",
      });
    await page.goto("/compare?items=epe-garden-plots,ibeju-lekki-sample-plot");
    await expect(page.locator(".comparison-property")).toHaveCount(2);
    expect(
      await page
        .locator(".comparison-scroll")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe("rgb(17, 30, 42)");
    await page.emulateMedia({ media: "print" });
    expect(
      await page
        .locator("html")
        .evaluate((el) => getComputedStyle(el).colorScheme),
    ).toBe("light");
    expect(
      await page
        .locator("html")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe("rgb(255, 255, 255)");
    await page.emulateMedia({ media: "screen" });
    expect(errors).toEqual([]);
  });
