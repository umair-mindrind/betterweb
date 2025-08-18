import https from 'node:https';
import { chromium } from 'playwright';

function getCertInfo(hostname) {
  return new Promise((resolve) => {
    const req = https.request({ hostname, method: 'GET', port: 443, rejectUnauthorized: false }, (res) => {
      const cert = res.socket.getPeerCertificate();
      let daysToExpiry = null;
      if (cert && cert.valid_to) {
        const exp = new Date(cert.valid_to).getTime();
        daysToExpiry = Math.max(0, Math.round((exp - Date.now()) / (1000*60*60*24)));
      }
      resolve({ daysToExpiry });
      res.resume();
    });
    req.on('error', () => resolve({ daysToExpiry: null }));
    req.end();
  });
}

function parseCookieDomain(cookieStr, defaultHost) {
  const parts = cookieStr.split(';').map(p => p.trim());
  const domainPart = parts.find(p => /^domain=/i.test(p));
  if (!domainPart) return defaultHost;
  return domainPart.split('=')[1].replace(/^\./, '').toLowerCase();
}

const KNOWN_TRACKER_HOST_SUBSTR = [
  'google-analytics', 'googletagmanager', 'doubleclick', 'facebook', 'facebook.net', 'bing.com', 'tiktok', 'hotjar', 'segment', 'mixpanel', 'amplitude', 'adsystem', 'ads' 
];

export async function runSecurity(urlStr) {
  const start = Date.now();
  let browser;
  try {
    const u = new URL(urlStr);

    // Basic headers & cert via fetch and https
    const headersResp = await fetch(urlStr, { method: 'GET', redirect: 'follow' });
    const headers = Object.fromEntries([...headersResp.headers.entries()].map(([k,v])=>[k.toLowerCase(), v]));

    const headerChecks = {
      csp: !!headers['content-security-policy'],
      hsts: !!headers['strict-transport-security'],
      xfo:  !!headers['x-frame-options'],
      referrer: !!headers['referrer-policy'],
      permissions: !!headers['permissions-policy'],
    };
    const coverage = Object.values(headerChecks).filter(Boolean).length / Object.keys(headerChecks).length;

    const cert = u.protocol === 'https:' ? await getCertInfo(u.hostname) : { daysToExpiry: null };

    // Use Playwright to inspect cookies and scripts (for third-party/tracker detection)
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
    const context = await browser.newContext();
    const page = await context.newPage();

    const seenSetCookie = [];
    page.on('response', async (resp) => {
      try {
        const sc = resp.headers()['set-cookie'];
        if (sc) {
          // header can be comma-joined; split carefully
          if (Array.isArray(sc)) {
            sc.forEach(s => seenSetCookie.push(s));
          } else {
            // if multiple cookies are joined by comma this naive split may break on cookie values, but is fine for common cases
            sc.split(/,(?=[^;]+=)/).forEach(s => seenSetCookie.push(s.trim()));
          }
        }
      } catch (e) {
        // ignore
      }
    });

    await page.goto(urlStr, { waitUntil: 'load', timeout: 60000 });

    const documentCookie = await page.evaluate(() => document.cookie || '');
    const scriptSrcs = await page.evaluate(() => Array.from(document.scripts || []).map(s => s.src).filter(Boolean));

    // Normalize cookies list from document.cookie (name=value;...) and Set-Cookie headers
    const cookiesFromDoc = documentCookie ? documentCookie.split(';').map(s => s.trim()).filter(Boolean).map(s => s.split('=')[0] + '=' + s.split('=').slice(1).join('=')) : [];
    const cookieStrings = Array.from(new Set([...seenSetCookie, ...cookiesFromDoc]));

    const totalCookies = cookieStrings.length;
    let thirdPartyCount = 0;
    let missingSecure = 0;
    let missingSameSite = 0;
    const knownTrackersFound = new Set();

    for (const cstr of cookieStrings) {
      const domain = parseCookieDomain(cstr, u.hostname);
      if (domain && domain !== u.hostname) thirdPartyCount++;
      if (!/;\s*secure/i.test(cstr)) missingSecure++;
      if (!/;\s*samesite=/i.test(cstr)) missingSameSite++;
    }

    for (const s of scriptSrcs) {
      try {
        const h = new URL(s, urlStr).hostname;
        const lower = h.toLowerCase();
        for (const tk of KNOWN_TRACKER_HOST_SUBSTR) {
          if (lower.includes(tk)) knownTrackersFound.add(lower);
        }
      } catch (e) { /* ignore bad urls */ }
    }

    const scriptsThirdParty = scriptSrcs.filter(s => {
      try { return new URL(s, urlStr).hostname !== u.hostname; } catch (e) { return false; }
    }).length;

    // Simple cookie penalty heuristic: weight third-party and missing flags
    const penalty = Math.min(100, Math.round((thirdPartyCount * 3) + (missingSecure * 1.5) + (missingSameSite * 1)));

    const cookieChecks = {
      totalCookies,
      thirdPartyCount,
      scriptsThirdParty,
      missingSecure,
      missingSameSite,
      knownTrackers: Array.from(knownTrackersFound),
      cookiePenalty: penalty
    };

    const normalized = {
      headerChecks,
      headerCoveragePct: Math.round(coverage * 100),
      certDaysToExpiry: cert.daysToExpiry,
      cookieChecks,
      securityScore: Math.round(
        // 60% headers coverage + 25% cert runway (cap 90 days) + 15% cookie penalty (inverse)
        (coverage * 60) + (Math.min(90, cert.daysToExpiry ?? 0) / 90) * 25 + ((100 - cookieChecks.cookiePenalty) / 100) * 15
      )
    };

    const raw = { headers, cert, cookies: cookieStrings, documentCookie, scriptSrcs };
    return { success: true, durationMs: Date.now()-start, raw, normalized };
  } catch (e) {
    return { success: false, durationMs: Date.now()-start, error: String(e) };
  } finally {
    if (browser) await browser.close();
  }
}
