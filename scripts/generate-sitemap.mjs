/**
 * Pre-build script: generates static sitemap.xml and robots.txt
 * Run via: node scripts/generate-sitemap.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SITE_URL = "https://knowyourleader.in";

const districts = JSON.parse(
    readFileSync(join(ROOT, "data", "districts.json"), "utf-8")
);

// Ensure public dir exists
mkdirSync(join(ROOT, "public"), { recursive: true });

// ── Sitemap ──────────────────────────────────────────
const today = new Date().toISOString().split("T")[0];

const urls = [
    // Home
    { loc: "/", priority: "1.0", changefreq: "daily" },
];

// District pages
for (const d of districts) {
    urls.push({ loc: `/district/${d.id}`, priority: "0.8", changefreq: "weekly" });
    // Constituency pages
    for (const c of d.constituencies) {
        urls.push({ loc: `/constituency/${c.id}`, priority: "0.9", changefreq: "daily" });
    }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
        .map(
            (u) => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
        )
        .join("\n")}
</urlset>
`;

writeFileSync(join(ROOT, "public", "sitemap.xml"), sitemap, "utf-8");
console.log(`✅ sitemap.xml generated (${urls.length} URLs)`);

// ── Robots.txt ───────────────────────────────────────
const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

writeFileSync(join(ROOT, "public", "robots.txt"), robots, "utf-8");
console.log("✅ robots.txt generated");
