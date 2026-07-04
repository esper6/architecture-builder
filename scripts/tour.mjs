// End-to-end smoke tour: visits every tab, exercises the core interactions,
// screenshots each view, and fails on any console error.
// Usage: node scripts/tour.mjs [outDir]
import { chromium } from "playwright";

const BASE = "http://localhost:4173/";
const OUT = process.argv[2] ?? "tour-shots";
const errors = [];

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(String(err)));

await page.goto(BASE);
await page.waitForTimeout(800);

// --- Compare: switch scenario, switch category, add a third series, open detail
await page.getByRole("button", { name: "Regulated / Financial" }).click();
await page.getByRole("button", { name: "Backend Framework" }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: /Go net\/http|Go \+/i }).first().click().catch(() => {});
await page.getByRole("button", { name: "FastAPI", exact: true }).last().click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/1-compare-backend.png`, fullPage: true });

// --- Stack Builder: load an archetype, then break it on purpose
await page.getByRole("button", { name: "Stack Builder" }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Classic .NET enterprise" }).click();
await page.waitForTimeout(400);
// introduce an ecosystem violation: swap backend to Spring Boot while EF Core is selected
await page.getByLabel("Backend Framework").selectOption("spring-boot");
await page.waitForTimeout(400);
const blocker = await page.locator(".note.blocker").count();
await page.screenshot({ path: `${OUT}/2-stack-blocker.png`, fullPage: true });
// restore and check synergies render
await page.getByLabel("Backend Framework").selectOption("aspnet-core");
await page.waitForTimeout(400);
const synergies = await page.locator(".note.synergy").count();
await page.screenshot({ path: `${OUT}/3-stack-healthy.png`, fullPage: true });

// --- Swap Map: pick Kafka, expect the confused-with block
await page.getByRole("button", { name: "Swap Map" }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Kafka", exact: true }).first().click();
await page.waitForTimeout(300);
const confused = await page
  .locator(".confused-block .relation-item")
  .count();
await page.screenshot({ path: `${OUT}/4-swap-kafka.png`, fullPage: true });

// --- Learn
await page.getByRole("button", { name: "Learn" }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/5-learn.png`, fullPage: true });

await browser.close();

console.log(`blocker notes when EF Core + Spring Boot: ${blocker}`);
console.log(`synergy notes on healthy .NET stack: ${synergies}`);
console.log(`confused-with entries for Kafka: ${confused}`);
if (blocker < 1) errors.push("expected a blocker note for EF Core + Spring Boot");
if (synergies < 1) errors.push("expected synergy notes on the .NET archetype");
if (confused < 1) errors.push("expected confused-with entries for Kafka");

if (errors.length) {
  console.error("FAILURES:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("Tour passed with zero console errors.");
