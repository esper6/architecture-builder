// One-off visual check for the granularity feature: native dimension rows in
// the Compare table (Database category) and sub-score drill-downs in a
// backend's detail profile.
import { chromium } from "playwright";

const OUT = process.argv[2] ?? "tour-shots";
const errors = [];

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://localhost:4173/");
await page.waitForTimeout(800);
// make sure we're on Compare regardless of persisted tab
await page.getByRole("button", { name: "Compare", exact: true }).click();

// Database category → native rows should appear under the weighted score
await page.getByRole("button", { name: "Database", exact: true }).click();
await page.waitForTimeout(400);
const nativeHeader = await page.locator(".native-header").count();
await page.screenshot({ path: `${OUT}/native-database.png`, fullPage: true });

// Backend category → open ASP.NET Core profile → sub-score rows
await page.getByRole("button", { name: "Backend Framework" }).click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "ASP.NET Core", exact: true }).last().click();
await page.waitForTimeout(400);
const subRows = await page.locator(".score-table tr.sub").count();
await page.screenshot({ path: `${OUT}/subscores-backend.png`, fullPage: true });

await browser.close();

console.log(`native-header rows (Database compare): ${nativeHeader}`);
console.log(`sub-score rows (ASP.NET Core detail): ${subRows}`);
if (nativeHeader < 1) errors.push("expected native dimension section in Database compare table");
if (subRows !== 3) errors.push(`expected 3 sub-score rows, got ${subRows}`);
if (errors.length) {
  console.error("FAILURES:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("Granularity check passed with zero console errors.");
