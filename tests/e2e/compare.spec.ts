import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("shortlist from cards, enforce the limit, persist and remove from a detail page", async ({
  page,
}) => {
  await page.goto("/properties");
  for (const name of [
    "The Palm Residence",
    "The Ikoyi Retreat",
    "Cove Terraces",
    "Epe Garden Plots",
  ])
    await page
      .getByRole("button", { name: `Compare ${name}`, exact: true })
      .click();
  await page
    .getByRole("button", { name: "Compare Weekend at the Cove", exact: true })
    .click();
  await expect(
    page
      .getByRole("complementary", { name: "Comparison shortlist" })
      .getByRole("status"),
  ).toContainText("up to four");
  await page.reload();
  await expect(
    page.getByRole("complementary", { name: "Comparison shortlist" }),
  ).toContainText("4/4");
  await page.goto("/properties/the-palm-residence");
  await page
    .getByRole("button", {
      name: "Remove The Palm Residence from comparison",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("complementary", { name: "Comparison shortlist" }),
  ).toContainText("3/4");
  await page
    .getByRole("complementary", { name: "Comparison shortlist" })
    .getByRole("link")
    .click();
  await expect(page.locator(".comparison-property")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Clear shortlist", exact: true })
    .click();
  await expect(
    page.getByText("Your next chapter starts with a shortlist."),
  ).toBeVisible();
  await page
    .getByLabel("Listing category", { exact: true })
    .selectOption("Land for Sale");
  await page
    .getByLabel("Add a listing", { exact: true })
    .selectOption("epe-garden-plots");
  await page
    .getByRole("button", { name: "Add to comparison", exact: true })
    .click();
  await expect(page.locator(".comparison-property")).toHaveCount(1);
  await page
    .getByLabel("Add a listing", { exact: true })
    .selectOption("ibeju-lekki-sample-plot");
  await page
    .getByRole("button", { name: "Add to comparison", exact: true })
    .click();
  await expect(page.locator(".comparison-property")).toHaveCount(2);
  await expect(
    page.getByText("Lowest asking price", { exact: true }),
  ).toHaveCount(1);
});

test("shares listing IDs, distinguishes mixed payment periods and keeps private notes local", async ({
  page,
  context,
}, testInfo) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(
    "/compare?items=the-palm-residence,the-ikoyi-retreat,epe-garden-plots,unknown,the-palm-residence",
  );
  await expect(page.locator(".comparison-property")).toHaveCount(3);
  await expect(
    page.getByText(/These listings have different categories/),
  ).toBeVisible();
  await expect(
    page.getByText("Lowest asking price", { exact: true }),
  ).toHaveCount(0);
  const detail = page.locator("details").filter({
    has: page.locator("summary", { hasText: "The Palm Residence" }),
  });
  await detail.locator("summary").click();
  await detail
    .getByLabel("Extra upfront costs (₦)", { exact: true })
    .fill("500000");
  await detail
    .getByLabel("Other planned costs (₦)", { exact: true })
    .fill("250000");
  await detail.getByLabel("Schools distance (km)", { exact: true }).fill("1.2");
  await detail
    .getByLabel("Your inspection notes", { exact: true })
    .fill("Check the title after inspection.");
  await expect(page.locator(".comparison-total")).toContainText("285,750,000");
  await expect(
    page.getByRole("row").filter({
      has: page.getByRole("rowheader", {
        name: "Schools distance",
        exact: true,
      }),
    }),
  ).toContainText("1.2 km · your input");
  await page
    .getByRole("button", { name: "Share listings", exact: true })
    .click();
  const shared = new URL(
    await page.evaluate(() => navigator.clipboard.readText()),
  );
  expect(shared.pathname).toBe("/compare");
  expect(shared.searchParams.get("items")).toBe(
    "the-palm-residence,the-ikoyi-retreat,epe-garden-plots",
  );
  expect(shared.href).not.toContain("inspection");
  expect(shared.href).not.toContain("500000");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download CSV", exact: true }).click(),
  ]);
  const file = testInfo.outputPath("comparison.csv");
  await download.saveAs(file);
  const csv = await readFile(file, "utf8");
  expect(csv).toContain("285,750,000");
  expect(csv).toContain("Check the title after inspection.");
  await page.reload();
  await page
    .locator("details")
    .filter({ has: page.locator("summary", { hasText: "The Palm Residence" }) })
    .locator("summary")
    .click();
  await expect(
    page
      .locator("details")
      .filter({
        has: page.locator("summary", { hasText: "The Palm Residence" }),
      })
      .getByRole("textbox", { name: "Your inspection notes", exact: true }),
  ).toHaveValue("Check the title after inspection.");
  await page
    .locator("details")
    .filter({ has: page.locator("summary", { hasText: "The Palm Residence" }) })
    .getByRole("button", { name: "Reset this assessment", exact: true })
    .click();
  await expect(
    page
      .locator("details")
      .filter({
        has: page.locator("summary", { hasText: "The Palm Residence" }),
      })
      .getByRole("textbox", { name: "Your inspection notes", exact: true }),
  ).toHaveValue("");
  const fresh = await context.browser()!.newContext();
  const other = await fresh.newPage();
  await other.goto(shared.href);
  await expect(other.locator(".comparison-property")).toHaveCount(3);
  await expect(other.locator(".comparison-table")).not.toContainText(
    "Check the title after inspection.",
  );
  await fresh.close();
});

test("highlights comparable asking prices, filters identical rows and calculates stay budgets", async ({
  page,
}) => {
  await page.goto("/compare?items=the-palm-residence,cove-terraces");
  await expect(
    page.getByText("Lowest asking price", { exact: true }),
  ).toHaveCount(1);
  await expect(
    page.locator(".comparison-property").filter({ hasText: "Cove Terraces" }),
  ).toContainText("Lowest asking price");
  await page.getByLabel("Show differences only", { exact: true }).check();
  await expect(
    page.getByRole("rowheader", { name: "Power & water", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("rowheader", { name: "Asking price", exact: true }),
  ).toBeVisible();
  await page.goto("/compare?items=weekend-at-the-cove,lagos-city-stay");
  const stay = page.locator("details").filter({
    has: page.locator("summary", { hasText: "Weekend at the Cove" }),
  });
  await stay.locator("summary").click();
  await stay.getByLabel("Number of nights", { exact: true }).fill("3");
  await expect(page.locator(".comparison-total")).toContainText("450,000");
});

for (const width of [360, 768, 1024, 1440])
  test(`comparison is usable and printable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(
      "/compare?items=the-palm-residence,cove-terraces,epe-garden-plots,the-ikoyi-retreat",
    );
    const table = page.getByRole("region", {
      name: "Side-by-side property comparison",
    });
    await expect(table).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 360) {
      const cell = page.locator(".comparison-table thead th").nth(1);
      expect((await cell.boundingBox())!.width).toBeLessThanOrEqual(196);
    }
    await table.focus();
    await page.keyboard.press("End");
    await page
      .getByRole("button", {
        name: "Remove The Ikoyi Retreat from comparison",
        exact: true,
      })
      .click();
    await expect(page.locator(".comparison-property")).toHaveCount(3);
    await page.emulateMedia({ media: "print" });
    await expect(page.getByRole("banner")).toBeHidden();
    expect(await table.evaluate((el) => getComputedStyle(el).overflowX)).toBe(
      "visible",
    );
    await page.emulateMedia({ media: "screen" });
    if (width === 360 || width === 1440)
      await page.screenshot({
        path: `test-results/compare-${width}.png`,
        fullPage: false,
      });
  });
