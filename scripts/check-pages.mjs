import assert from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { chromium, expect } from "@playwright/test";

const output = path.resolve("dist-pages");
const base =
  (process.env.BASE_PATH ?? "/Aurelle-Estate").replace(/\/$/, "") + "/";
const prefix = base.replace(/\/$/, "");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
};
const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (prefix && url.pathname !== prefix && !url.pathname.startsWith(base)) {
    res.writeHead(404).end();
    return;
  }
  let file = path.resolve(
    output,
    decodeURIComponent(url.pathname.slice(prefix.length)).replace(/^\//, ""),
  );
  if (file !== output && !file.startsWith(output + path.sep)) {
    res.writeHead(400).end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!url.pathname.endsWith("/")) {
      res.writeHead(301, { Location: url.pathname + "/" + url.search }).end();
      return;
    }
    file = path.join(file, "index.html");
  }
  const status = existsSync(file) ? 200 : 404;
  if (status === 404) file = path.join(output, "404.html");
  res
    .writeHead(status, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
    })
    .end(readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  const origin = `http://127.0.0.1:${server.address().port}`;
  const root = origin + base;
  const index = await (await fetch(root)).text();
  assert.match(index, /<div id="root"><\/div>/);
  assert.doesNotMatch(index, /src\/main\.tsx/);
  assert.ok(existsSync(path.join(output, ".nojekyll")));
  for (const match of index.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (match[1].startsWith(base))
      assert.equal((await fetch(origin + match[1])).status, 200, match[1]);
  }
  const manifest = await (await fetch(root + "site.webmanifest")).json();
  assert.equal(manifest.start_url, base);
  assert.equal((await fetch(origin + manifest.icons[0].src)).status, 200);
  const routes = [
    ...readFileSync(path.join(output, "sitemap.xml"), "utf8").matchAll(
      /<loc>([^<]+)<\/loc>/g,
    ),
  ].map((m) => new URL(m[1]).pathname);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of routes) {
    assert.equal(
      (
        await page.goto(origin + route, { waitUntil: "domcontentloaded" })
      ).status(),
      200,
      route,
    );
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("main h1")).not.toHaveText(
      "Let’s find your way home.",
    );
    assert.equal(
      (await page.reload({ waitUntil: "domcontentloaded" })).status(),
      200,
      `Refresh ${route}`,
    );
    await expect(page.locator("main h1")).toBeVisible();
  }
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(root, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main h1")).toBeVisible();
    await expect
      .poll(() =>
        page
          .getByRole("banner")
          .locator("img")
          .evaluate((img) => img.naturalWidth),
      )
      .toBeGreaterThan(0);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
      `${width}px overflow`,
    );
    const links = await page
      .locator("a[href]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")));
    for (const href of links.filter((h) => h.startsWith("/")))
      assert.ok(href.startsWith(base), `Link escapes base: ${href}`);
    await page
      .getByRole("button", { name: "Chat with Aurelle Agent", exact: true })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Aurelle Agent",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("link", { name: "Chat on WhatsApp", exact: true }),
    ).toHaveAttribute("href", new RegExp(encodeURIComponent(base)));
    await page.keyboard.press("Escape");
  }
  assert.equal(
    (
      await page.goto(root + "unknown-page", { waitUntil: "domcontentloaded" })
    ).status(),
    404,
  );
  await expect(page.locator("main h1")).toHaveText("Let’s find your way home.");
  assert.deepEqual(errors, []);
  console.log(
    `PASS: ${routes.length} built routes and reloads; JS/CSS, logo, manifest, 404, links and chat at four widths (${base}).`,
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
