# Scripts

- **validate-browser-safe.js** – Validates that SDK builds are browser-safe (no Node-only APIs).
- **test-bundlers.js** – Runs bundler tests.

## Sanity / reporting

The **canonical** sanity report is at repo root: **sanity-report.mjs** (run via `npm run test:sanity-report`).

Legacy report scripts (Slack/GOCD integration) are in this folder:

- **sanity-report-dev11.mjs** – Dev11 pipeline (run from repo root: `node scripts/sanity-report-dev11.mjs`).
- **sanity-report-ts-sdk.js** – TS SDK Slack notification (run from repo root: `node scripts/sanity-report-ts-sdk.js`).
