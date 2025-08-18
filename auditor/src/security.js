import https from "node:https";
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
    // best-effort, don't fail the audit if saving fails
    console.warn("saveRawToFile security write failed:", err?.message || err);
  }
}

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

export async function runSecurity(urlStr) {
  const start = Date.now();
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

    // save raw headers + cert prior to normalization/filtering
    // await saveRawToFile({ headers, cert }, `security-${u.hostname}`);

    const normalized = {
      headerChecks,
      headerCoveragePct: Math.round(coverage * 100),
      certDaysToExpiry: cert.daysToExpiry,
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
