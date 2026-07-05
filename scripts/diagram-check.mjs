// Visual check for the stack blueprint: loads archetypes covering different
// architecture topologies and screenshots the diagram card of each.
import { chromium } from "playwright";

const OUT = process.argv[2] ?? "tour-shots";
const errors = [];

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://localhost:4173/");
await page.waitForTimeout(700);
await page.getByRole("button", { name: "Stack Builder" }).click();
await page.waitForTimeout(300);
// make sure no challenge banner blocks the archetype chips
const abandon = page.getByRole("button", { name: "Abandon" });
if (await abandon.count()) await abandon.click();

const shots = [
  ["Classic .NET enterprise", "modular-monolith"],
  ["Full-stack TypeScript startup", "monolith"],
  ["High-scale event pipeline", "event-driven"],
];
for (const [name, slug] of shots) {
  await page.getByRole("button", { name }).click();
  await page.waitForTimeout(400);
  await page
    .locator(".card", { has: page.locator(".stack-diagram") })
    .screenshot({ path: `${OUT}/diagram-${slug}.png` });
}

// microservices + cqrs + serverless aren't in archetypes — set via selects
await page.getByLabel("Architecture Style").selectOption("microservices");
await page.waitForTimeout(400);
await page
  .locator(".card", { has: page.locator(".stack-diagram") })
  .screenshot({ path: `${OUT}/diagram-microservices.png` });

await page.getByLabel("Architecture Style").selectOption("cqrs-es");
await page.waitForTimeout(400);
await page
  .locator(".card", { has: page.locator(".stack-diagram") })
  .screenshot({ path: `${OUT}/diagram-cqrs.png` });

await page.getByLabel("Architecture Style").selectOption("serverless-arch");
await page.waitForTimeout(400);
await page
  .locator(".card", { has: page.locator(".stack-diagram") })
  .screenshot({ path: `${OUT}/diagram-serverless.png` });

// conflict arcs: monolith + kafka + kubernetes frictions
await page.getByRole("button", { name: "Boring-on-purpose internal tool" }).click();
await page.waitForTimeout(300);
await page.getByLabel("Messaging & Events").selectOption("kafka");
await page.getByLabel("Hosting & Deployment").selectOption("kubernetes");
await page.waitForTimeout(400);
const arcs = await page.locator(".stack-diagram path[stroke='var(--critical)']").count();
await page
  .locator(".card", { has: page.locator(".stack-diagram") })
  .screenshot({ path: `${OUT}/diagram-conflicts.png` });

await browser.close();
console.log(`conflict arcs on monolith+kafka+k8s: ${arcs}`);
if (arcs < 1) errors.push("expected conflict arcs for kafka/k8s under a monolith");
if (errors.length) {
  console.error("FAILURES:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("Diagram check passed with zero console errors.");
