#!/usr/bin/env node
import { runLighthouse } from './lighthouse.js';
import { runAxe } from './axe.js';
import { runSecurity } from './security.js';

function arg(name, def=null) {
  const m = process.argv.find(a => a.startsWith(`--${name}=`));
  return m ? m.split('=')[1] : def;
}

(async () => {
  const url = arg('url');
  const chromePath = arg('chromePath', process.env.CHROME_PATH || '');
  if (!url) { console.error('Missing --url'); process.exit(2); }

  const [lh, axe, sec] = await Promise.all([
    runLighthouse(url, { chromePath }),
    runAxe(url),
    runSecurity(url)
  ]);

  const out = { lighthouse: lh, axe, security: sec };
  process.stdout.write(JSON.stringify(out));
})();
