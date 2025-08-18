import https from "node:https";

function getCertInfo(hostname) {
  return new Promise((resolve) => {
    const req = https.request(
      { hostname, method: "GET", port: 443, rejectUnauthorized: false },
      (res) => {
        const cert = res.socket.getPeerCertificate();
        let daysToExpiry = null;
        if (cert && cert.valid_to) {
          const exp = new Date(cert.valid_to).getTime();
          daysToExpiry = Math.max(
            0,
            Math.round((exp - Date.now()) / (1000 * 60 * 60 * 24))
          );
        }
        resolve({ daysToExpiry });
        res.resume();
      }
    );
    req.on("error", () => resolve({ daysToExpiry: null }));
    req.end();
  });
}

function parseCookieDomain(cookieStr, defaultHost) {
  const parts = cookieStr.split(";").map((p) => p.trim());
  const domainPart = parts.find((p) => /^domain=/i.test(p));
  if (!domainPart) return defaultHost;
  return domainPart.split("=")[1].replace(/^\./, "").toLowerCase();
}

const KNOWN_TRACKER_HOST_SUBSTR = [
  "google-analytics",
  "googletagmanager",
  "doubleclick",
  "facebook",
  "facebook.net",
  "bing.com",
  "tiktok",
  "hotjar",
  "segment",
  "mixpanel",
  "amplitude",
  "adsystem",
  "ads",
];

export async function runSecurity(urlStr) {
  const start = Date.now();
  let browser;
  try {
    const u = new URL(urlStr);
    const headersResp = await fetch(urlStr, {
      method: "GET",
      redirect: "follow",
    });
    const headers = Object.fromEntries(
      [...headersResp.headers.entries()].map(([k, v]) => [k.toLowerCase(), v])
    );

    const headerChecks = {
      csp: !!headers["content-security-policy"],
      hsts: !!headers["strict-transport-security"],
      xfo: !!headers["x-frame-options"],
      referrer: !!headers["referrer-policy"],
      permissions: !!headers["permissions-policy"],
    };
    const coverage =
      Object.values(headerChecks).filter(Boolean).length /
      Object.keys(headerChecks).length;

    const cert =
      u.protocol === "https:"
        ? await getCertInfo(u.hostname)
        : { daysToExpiry: null };

    const normalized = {
      headerChecks,
      headerCoveragePct: Math.round(coverage * 100),
      certDaysToExpiry: cert.daysToExpiry,
      cookieChecks,
      securityScore: Math.round(
        // 70% headers coverage + 30% cert runway (cap at 90 days)
        coverage * 70 + (Math.min(90, cert.daysToExpiry ?? 0) / 90) * 30
      ),
    };
    return {
      success: true,
      durationMs: Date.now() - start,
      raw: { headers, cert },
      normalized,
    };
  } catch (e) {
    return { success: false, durationMs: Date.now() - start, error: String(e) };
  }
}
