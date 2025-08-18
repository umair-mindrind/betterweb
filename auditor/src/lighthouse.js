import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import fs from 'node:fs';
import { chromium } from 'playwright'; // fallback browser

export async function runLighthouse(url, { chromePath }) {
  const start = Date.now();
  let chrome;

  // If CHROME_PATH is missing or invalid, use Playwright's Chromium
  let executablePath = chromePath && fs.existsSync(chromePath)
    ? chromePath
    : chromium.executablePath();   // works after `npx playwright install chromium`

  try {
    chrome = await launch({
      chromePath: executablePath,           // leave undefined if you want auto-detect
      chromeFlags: ['--headless=new', '--no-sandbox'],
      logLevel: 'error',
    });

    const options = {
      port: chrome.port,
      output: 'json',
      onlyCategories: ['performance', 'seo'],
      logLevel: 'error',
      emulatedFormFactor: 'mobile',
      throttlingMethod: 'provided',
    };

    const runnerResult = await lighthouse(url, options);
    const raw = runnerResult.lhr;
    const normalized = {
      performanceScore: raw.categories?.performance?.score ?? 0,
      seoScore:         raw.categories?.seo?.score ?? 0,
      metrics: {
        lcp: raw.audits?.['largest-contentful-paint']?.numericValue ?? null,
        cls: raw.audits?.['cumulative-layout-shift']?.numericValue ?? null,
        tti: raw.audits?.['interactive']?.numericValue ?? null,
        fcp: raw.audits?.['first-contentful-paint']?.numericValue ?? null,
        si:  raw.audits?.['speed-index']?.numericValue ?? null,
      }
    };

    return { success: true, durationMs: Date.now() - start, raw, normalized };
  } catch (e) {
    return { success: false, durationMs: Date.now() - start, error: String(e) };
  } finally {
    if (chrome) await chrome.kill();
  }
}
