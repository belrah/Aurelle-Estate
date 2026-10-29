import { test, expect } from "@playwright/test";

for (const width of [360, 768, 1024, 1440]) {
  test(`agent chat connects the three supplied accounts at ${width}px`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/properties?privateDraft=not-shared");
    const launcher = page.getByRole("button", {
      name: "Chat with Aurelle Agent",
      exact: true,
    });
    await launcher.click();
    const dialog = page.getByRole("dialog", {
      name: "Aurelle Agent",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    const bounds = await dialog.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    const close = dialog.getByRole("button", {
      name: "Close agent chat",
      exact: true,
    });
    await expect(close).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(
      dialog.getByRole("link", { name: "Chat on WhatsApp", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await dialog
      .getByRole("button", { name: "Book an inspection", exact: true })
      .click();
    await dialog
      .getByLabel("Your message (optional)")
      .fill("I would like to view a home in Lekki.");
    const whatsapp = dialog.getByRole("link", {
      name: "Chat on WhatsApp",
      exact: true,
    });
    const waUrl = new URL((await whatsapp.getAttribute("href"))!);
    expect(waUrl.host).toBe("wa.me");
    expect(waUrl.pathname).toBe("/2348102180628");
    expect(waUrl.searchParams.get("text")).toContain(
      "Interest: Book an inspection.",
    );
    expect(waUrl.searchParams.get("text")).toContain("view a home in Lekki");
    expect(waUrl.searchParams.get("text")).not.toContain("privateDraft");
    await expect(whatsapp).toHaveAttribute("target", "_blank");
    await expect(whatsapp).toHaveAttribute("rel", "noopener noreferrer");
    await dialog.getByRole("button", { name: "Telegram", exact: true }).click();
    const tgUrl = new URL(
      (await dialog
        .getByRole("link", { name: "Chat on Telegram", exact: true })
        .getAttribute("href"))!,
    );
    expect(tgUrl.origin + tgUrl.pathname).toBe("https://t.me/+2348102180628");
    expect(tgUrl.searchParams.get("text")).toBe(waUrl.searchParams.get("text"));
    await dialog
      .getByRole("button", { name: "Instagram", exact: true })
      .click();
    await expect(
      dialog.getByRole("link", { name: "Chat on Instagram", exact: true }),
    ).toHaveAttribute("href", "https://ig.me/m/belhrah");
    await dialog
      .getByRole("button", { name: "Copy message", exact: true })
      .click();
    await expect(dialog.getByRole("status")).toHaveText(
      "Message copied. Paste it into your conversation.",
    );
    expect(
      (await page.evaluate(() => navigator.clipboard.readText())).replace(
        /\r\n/g,
        "\n",
      ),
    ).toBe(waUrl.searchParams.get("text"));
    if (width === 360 || width === 1440)
      await page.screenshot({
        path: `test-results/agent-chat-${width}.png`,
        animations: "disabled",
      });
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(launcher).toBeFocused();
    await launcher.click();
    await page
      .getByRole("button", { name: "Close chat overlay", exact: true })
      .click({ position: { x: 1, y: 1 } });
    await expect(dialog).toBeHidden();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
