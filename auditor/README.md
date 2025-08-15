# BetterWeb Auditor

## Quick run

```
# Install deps
cd auditor
npm i

# (Optional) ensure CHROME_PATH points to a Chromium/Chrome binary (or rely on system chrome)
export CHROME_PATH=/usr/bin/google-chrome

# Test run
node src/index.js --url=https://example.com --chromePath=$CHROME_PATH > /tmp/audit.json
```
