import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const output = path.resolve("dist-pages");
const base =
  (process.env.BASE_PATH ?? "/Aurelle-Estate").replace(/\/$/, "") + "/";
if (!base.startsWith("/") || base.startsWith("//"))
  throw new Error("BASE_PATH must be an absolute site path.");
const origin =
  (process.env.SITE_URL || `https://belrah.github.io${base}`).replace(
    /\/$/,
    "",
  ) + "/";
const sourceSitemap = readFileSync("public/sitemap.xml", "utf8");
const routes = [
  ...new Set(
    [...sourceSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1]).pathname,
    ),
  ),
];
if (!routes.includes("/"))
  throw new Error("The sitemap must include the homepage.");
for (const route of routes) {
  if (route === "/") continue;
  const target = path.resolve(output, route.replace(/^\//, ""), "index.html");
  if (!target.startsWith(output + path.sep))
    throw new Error("Route escapes build output.");
  mkdirSync(path.dirname(target), { recursive: true });
  copyFileSync(path.join(output, "index.html"), target);
}
copyFileSync(path.join(output, "index.html"), path.join(output, "404.html"));
writeFileSync(path.join(output, ".nojekyll"), "");
const manifest = JSON.parse(
  readFileSync(path.join(output, "site.webmanifest"), "utf8"),
);
manifest.start_url = base;
manifest.scope = base;
manifest.icons = manifest.icons.map((icon) => ({
  ...icon,
  src: base + icon.src.replace(/^\//, ""),
}));
writeFileSync(path.join(output, "site.webmanifest"), JSON.stringify(manifest));
writeFileSync(
  path.join(output, "sitemap.xml"),
  sourceSitemap.replace(
    /<loc>([^<]+)<\/loc>/g,
    (_, url) =>
      `<loc>${new URL(new URL(url).pathname.replace(/^\//, ""), origin).href}</loc>`,
  ),
);
writeFileSync(
  path.join(output, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${origin}sitemap.xml\n`,
);
console.log(`Prepared ${routes.length} directly loadable routes at ${base}`);
