import { test, expect } from "@playwright/test";
test("home navigation, property filters, detail, save and share", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page
    .getByRole("link", { name: "Explore Properties", exact: true })
    .click();
  await expect(page).toHaveURL(/\/properties/);
  await page.getByRole("button", { name: "For Rent", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("1 space");
  await page
    .getByRole("link", { name: "The Ikoyi Retreat", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "The Ikoyi Retreat", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Saved", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Saved", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(page.getByText("Link copied.")).toBeVisible();
});
test("calculator reacts to input and rejects invalid deposits", async ({
  page,
}) => {
  await page.goto("/mortgage");
  const payment = page.getByTestId("monthly-payment");
  const initial = await payment.textContent();
  await page.getByLabel("Annual interest rate (%)", { exact: true }).fill("0");
  await expect(payment).not.toHaveText(initial!);
  await expect(payment).toContainText("333,333");
  await page.getByLabel("Annual interest rate (%)", { exact: true }).fill("60");
  await expect(page.getByLabel("Annual interest rate slider")).toHaveValue(
    "60",
  );
  await page.getByLabel("Deposit amount (₦)").fill("200000000");
  await expect(page.getByRole("alert")).toBeVisible();
});
test("contact form validation and honest submission state", async ({
  page,
}) => {
  await page.goto("/contact?type=Mortgage");
  await expect(page.getByLabel("I’m interested in")).toHaveValue("Mortgage");
  await page.getByRole("button", { name: "Prepare enquiry" }).click();
  await expect(page.getByText("Enter your name.")).toBeVisible();
  await page.getByLabel("Your name").fill("Ada Example");
  await page.getByLabel("Email address").fill("ada@example.com");
  await page.getByLabel("Phone number").fill("08012345678");
  await page
    .getByLabel("Tell us a little more")
    .fill("Please help me plan an inspection.");
  await page.getByRole("button", { name: "Prepare enquiry" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Nothing has been sent or saved",
  );
});
test("agent wizard preserves fields and requires consent", async ({ page }) => {
  await page.goto("/agents/sign-up");
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByText("Enter your full name.")).toBeVisible();
  for (const [label, value] of [
    ["Full name", "Ada Example"],
    ["Email address", "ada@example.com"],
    ["Phone number", "08012345678"],
    ["WhatsApp number", "08012345678"],
    ["Residential address", "Example address, Lagos"],
    ["Date of birth", "1995-01-01"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("button", { name: "Next step" }).click();
  await page.getByLabel("Specialisation").selectOption("Sales");
  await page.getByLabel("Areas served").fill("Lekki");
  await page
    .getByLabel("Short bio")
    .fill(
      "An independent property professional interested in thoughtful client service.",
    );
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByLabel("Account number")).toBeDisabled();
  await page.getByRole("button", { name: "Next step" }).click();
  await page.getByRole("button", { name: "Submit Application" }).click();
  await expect(page.getByRole("alert")).toContainText("Please confirm");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Submit Application" }).click();
  await expect(page.getByRole("status")).toContainText("No application");
});
test("Agents navigation opens the full agent page and embedded application", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Agents", exact: true })
    .click();
  await expect(page).toHaveURL(/\/agents$/);
  await expect(
    page.getByRole("heading", {
      name: "Your local knowledge. Our next chapter.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "From introduction to partnership." }),
  ).toBeVisible();
  const agreement = page.getByRole("region", {
    name: "Agency agreement terms and conditions",
  });
  await expect(agreement).toContainText(
    "This AGENCY AGREEMENT is made between (Applying Agent) and Aurelle Limited",
  );
  await expect(agreement).toContainText(
    "By submitting this form, you agree to the terms and conditions stated below.",
  );
  for (const title of [
    "Agency Relationship",
    "Agency Duties",
    "Commission",
    "Indemnification",
    "Termination",
  ])
    await expect(
      agreement.getByRole("heading", { name: new RegExp(title) }),
    ).toHaveCount(1);
  await page
    .getByRole("link", { name: "Sign up as an agent", exact: true })
    .click();
  await expect(page.getByLabel("Full name", { exact: true })).toBeInViewport();
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByText("Enter your full name.")).toBeVisible();
});
for (const width of [360, 768, 1024, 1440])
  test(`agent page responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/agents");
    await expect(page.locator("main h1")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (width < 801) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await expect(
        page
          .getByRole("navigation", { name: "Mobile navigation" })
          .getByRole("link", { name: "Agents", exact: true }),
      ).toHaveAttribute("href", "/agents");
      await page.getByRole("button", { name: "Close navigation" }).click();
    }
    await page.screenshot({ path: `test-results/agents-${width}.png` });
  });
test("all pages and sample content resolve", async ({ page }) => {
  for (const path of [
    "/about",
    "/services",
    "/agents",
    "/agents/login",
    "/privacy",
    "/terms",
    "/reed",
    "/reed/before-you-buy-in-lagos",
    "/not-found",
  ]) {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("main")).not.toBeEmpty();
  }
});
test("article search and property gallery", async ({ page }) => {
  await page.goto("/reed");
  await page.getByLabel("Search articles").fill("paperwork");
  await expect(page.getByRole("status")).toContainText("1 sample");
  await page.goto("/properties/the-palm-residence");
  await page
    .getByRole("button", { name: "Open property image gallery" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
for (const width of [360, 768, 1024, 1440])
  test(`responsive layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Good spaces. Better living." }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Find my space" })
      .click({ trial: true });
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
    if (width < 801) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: "Mortgage", exact: true })
        .click();
      await expect(page).toHaveURL(/mortgage/);
    }
  });
