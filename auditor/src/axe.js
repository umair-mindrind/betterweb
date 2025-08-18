import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import path from "node:path";

async function saveRawToFile(raw, prefix) {
  try {
    const dir = path.resolve(process.cwd(), "raw");
    await fs.mkdir(dir, { recursive: true });
    const safe = prefix.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
    const filename = `${safe}-${Date.now()}.json`;
    const full = path.join(dir, filename);
    await fs.writeFile(full, JSON.stringify(raw, null, 2), "utf8");
  } catch (err) {
    console.warn("saveRawToFile axe write failed:", err?.message || err);
  }
}

export async function runAxe(url) {
  const start = Date.now();
  let browser;
  try {
    browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "load", timeout: 60000 });
    const results = await new AxeBuilder({ page }).analyze();

    // // save raw results before any counts/normalization
    // try {
    //   await saveRawToFile(results, `axe-${new URL(url).hostname}`);
    // } catch (e) {
    //   /* best-effort */
    // }

    const violations = results.violations || [];
    const countsByImpact = violations.reduce((acc, v) => {
      acc[v.impact || "unknown"] =
        (acc[v.impact || "unknown"] || 0) + v.nodes.length;
      return acc;
    }, {});

    // Simple penalty: weight criticality (tweak later)
    const weight = {
      critical: 10,
      serious: 6,
      moderate: 3,
      minor: 1,
      unknown: 1,
    };
    const penalty = Object.entries(countsByImpact).reduce(
      (sum, [k, c]) => sum + (weight[k] || 1) * c,
      0
    );
    const normalized = {
      countsByImpact,
      totalNodes: violations.reduce((s, v) => s + v.nodes.length, 0),
      violationScorePenalty: Math.min(100, penalty),
    };

    return {
      success: true,
      durationMs: Date.now() - start,
      raw: results,
      normalized,
    };
  } catch (e) {
    return { success: false, durationMs: Date.now() - start, error: String(e) };
  } finally {
    if (browser) await browser.close();
  }
}
