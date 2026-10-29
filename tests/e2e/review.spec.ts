import { test, expect } from "@playwright/test";
import { articles, properties, services } from "../../src/data";
const paths = [
  "/",
  "/properties",
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
for (const width of [360, 768, 1024, 1440])
  test(`all ${paths.length} pages render, fit and have valid internal links at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of paths) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("main h1")).toHaveCount(1);
      await expect(page.locator("main h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route,
      ).toBe(true);
      const links = await page
        .locator("a[href]")
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")!));
      for (const href of links) {
        expect(href.trim().length, `${route}: empty link`).toBeGreaterThan(0);
        if (href.startsWith("/"))
          expect(paths, `${route}: ${href}`).toContain(href.split(/[?#]/)[0]);
        if (href.startsWith("#"))
          expect(
            await page.evaluate(
              (id) => !!document.getElementById(id),
              href.slice(1),
            ),
            `${route}: ${href}`,
          ).toBe(true);
        expect(href.toLowerCase().startsWith("javascript:")).toBe(false);
      }
    }
    expect(errors).toEqual([]);
  });
test("homepage search includes type on Enter and query navigation refreshes results", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Search location").fill(" Ajah ");
  await page.getByLabel("Search property type").selectOption("Terrace");
  await page.getByLabel("Search location").press("Enter");
  await expect(page.getByRole("status")).toContainText("1 space");
  await expect(
    page.getByRole("link", { name: "Cove Terraces", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Properties", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("6 spaces");
  await page.goBack();
  await expect(page.getByRole("status")).toContainText("1 space");
});
test("all property controls combine, zero price is respected, and map fallback returns to grid", async ({
  page,
}) => {
  await page.goto("/properties");
  await page.getByLabel("Location", { exact: true }).fill("Lekki");
  await page.getByLabel("Min price (₦)").fill("200000000");
  await page.getByLabel("Max price (₦)").fill("300000000");
  await page.getByLabel("Bedrooms", { exact: true }).selectOption("5");
  await page.getByLabel("Bathrooms", { exact: true }).selectOption("4");
  await page
    .getByLabel("Property type", { exact: true })
    .selectOption("Detached house");
  await page.getByLabel("Status", { exact: true }).selectOption("Available");
  await expect(page.getByRole("status")).toContainText("1 space");
  await page.getByLabel("Max price (₦)").fill("0");
  await expect(page.getByLabel("Max price (₦)")).toHaveValue("0");
  await expect(page.getByRole("status")).toContainText("0 spaces");
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await expect(page.getByRole("status")).toContainText("6 spaces");
  await page.getByRole("button", { name: "Map view" }).click();
  await expect(
    page.getByRole("heading", { name: "A map needs a little more detail." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to the properties" }).click();
  await expect(page.locator(".property-card")).toHaveCount(6);
});
test("each service CTA selects its corresponding enquiry", async ({ page }) => {
  for (let i = 0; i < services.length; i++) {
    await page.goto("/services");
    await page
      .getByRole("link", { name: "Get started", exact: true })
      .nth(i)
      .click();
    await expect(page.getByLabel("I’m interested in")).toHaveValue(
      services[i][3],
    );
  }
});
test("switching enquiry links on the contact page updates the form and validates inspections", async ({
  page,
}) => {
  await page.goto("/contact?type=Mortgage");
  await page
    .getByRole("link", { name: "Book an inspection", exact: true })
    .click();
  await expect(page.getByLabel("I’m interested in")).toHaveValue("Inspection");
  await page.getByLabel("Your name").fill("Ada Example");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("ada@example.com");
  await page.getByLabel("Phone number").fill("08012345678");
  await page
    .getByLabel("Tell us a little more")
    .fill("Please arrange a property inspection.");
  await page.getByRole("button", { name: "Prepare enquiry" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Choose a future inspection date",
  );
  const date = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  await page.getByLabel("Preferred inspection date").fill(date);
  await page.getByLabel("Preferred inspection time").fill("10:00");
  await page.getByRole("button", { name: "Prepare enquiry" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Nothing has been sent or saved",
  );
});
test("mobile navigation contains keyboard focus, scrolls and restores focus on Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Get Started" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toHaveCount(0);
  await page.goto("/agents");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Agents", exact: true })
    .click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toHaveCount(0);
});
test("gallery contains keyboard focus and returns focus to its opener", async ({
  page,
}) => {
  await page.goto("/properties/the-palm-residence");
  const opener = page.getByRole("button", {
    name: "Open property image gallery",
  });
  await opener.click();
  await expect(
    page.getByRole("button", { name: "Close gallery" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Next image" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Close gallery" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
});
test("saved state follows the property when navigating between detail pages", async ({
  page,
}) => {
  await page.goto("/properties/the-palm-residence");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page
    .getByRole("link", { name: "The Ikoyi Retreat", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Save", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page
    .getByRole("link", { name: "The Palm Residence", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Saved", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("invalid profile photo blocks agent step progression", async ({
  page,
}) => {
  await page.goto("/agents/sign-up");
  await page.getByLabel("Profile photo (optional)").setInputFiles({
    name: "invalid.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Not an image"),
  });
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByText("STEP 1 OF 4")).toBeVisible();
  await expect(
    page.getByText("Error: choose a JPG, PNG or WebP up to 5 MB."),
  ).toBeVisible();
});
