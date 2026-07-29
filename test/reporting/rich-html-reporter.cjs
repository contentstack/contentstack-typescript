/**
 * Rich single-file HTML reporter for the delivery-SDK API tests.
 *
 * Renders one self-contained, timestamped HTML file with per-test "Additional
 * Test Context" shown INLINE (SDK method, API request+status, copy-paste cURL,
 * request/response headers, response body) — modeled on the CMA SDK's report.
 *
 * HTTP context comes from test-results/http-captures.jsonl, appended per test by
 * jest.setup.ts when ENABLE_HTTP_CAPTURE=true. Output: reports/api-report-<ts>.html
 * (filename timestamped, no nested folder). The absolute path is printed at run end.
 */
const fs = require('fs');
const path = require('path');

function esc(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function pretty(v) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

class RichHtmlReporter {
  constructor(globalConfig, options) {
    this._options = options || {};
    this._suites = [];
    this._capturesFile = path.resolve(process.cwd(), 'test-results', 'http-captures.jsonl');
  }

  onRunStart() {
    // Start each run with a clean capture sidecar.
    try {
      if (fs.existsSync(this._capturesFile)) fs.unlinkSync(this._capturesFile);
    } catch {
      /* ignore */
    }
  }

  onTestResult(_test, testResult) {
    this._suites.push({
      file: testResult.testFilePath,
      tests: (testResult.testResults || []).map((t) => ({
        fullName: t.fullName,
        title: t.title,
        ancestorTitles: t.ancestorTitles || [],
        status: t.status,
        failureMessages: t.failureMessages || [],
        duration: t.duration || 0,
      })),
    });
  }

  _loadCaptures() {
    const byKey = {};
    const byName = {};
    try {
      if (!fs.existsSync(this._capturesFile)) return { byKey, byName };
      const lines = fs.readFileSync(this._capturesFile, 'utf8').split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const r = JSON.parse(line);
          const rec = { capture: r.capture || null, assertions: r.assertions || [] };
          byKey[`${r.testPath}::${r.testName}`] = rec;
          byName[r.testName] = rec; // fallback if testPath differs
        } catch {
          /* skip bad line */
        }
      }
    } catch {
      /* ignore */
    }
    return { byKey, byName };
  }

  onRunComplete(_contexts, results) {
    const { byKey, byName } = this._loadCaptures();

    // Fixed output path (default matches the path the GoCD pipelines already link to).
    const outFile = path.resolve(
      process.cwd(),
      this._options.outputPath || 'reports/contentstack-delivery/html/index.html'
    );
    const outDir = path.dirname(outFile);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const displayTs = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const html = this._render(results, byKey, byName, displayTs);
    fs.writeFileSync(outFile, html);

    // eslint-disable-next-line no-console
    console.log(`\n\u{1F4C4} Rich API test report: ${outFile}\n`);
  }

  _renderContext(rec, test) {
    const cap = rec && rec.capture;
    const assertions = (rec && rec.assertions) || [];
    const passed = test.status === 'passed';
    const rows = [];
    rows.push(
      `<div class="ctx-label">✅ Test Result:</div><div class="ctx-val ${passed ? 'ok' : 'bad'}">${passed ? 'PASSED' : test.status.toUpperCase()}</div>`
    );

    if (assertions.length) {
      // Human-friendly "expected" text for argument-less matchers (which have no expected value).
      const NOARG = {
        toBeDefined: 'to be defined (not undefined)',
        toBeUndefined: 'to be undefined',
        toBeNull: 'to be null',
        toBeTruthy: 'to be truthy',
        toBeFalsy: 'to be falsy',
        toBeNaN: 'to be NaN',
        toHaveBeenCalled: 'to have been called',
      };
      const items = assertions
        .map((a) => {
          const name = `${a.isNot ? 'not.' : ''}${a.matcher}`;
          let exp = a.expected;
          if (exp === '') exp = NOARG[a.matcher] || '— (argument-less matcher)';
          return (
            `<div class="assn ${a.passed ? 'ok' : 'bad'}"><div class="assn-h">${a.passed ? '✓' : '✗'} <span class="mono">${esc(name)}</span></div>` +
            `<div class="assn-kv"><span class="k">Expected:</span><pre class="assn-v">${esc(exp)}</pre></div>` +
            `<div class="assn-kv"><span class="k">Actual:</span><pre class="assn-v">${esc(a.actual)}</pre></div></div>`
          );
        })
        .join('');
      const npass = assertions.filter((a) => a.passed).length;
      rows.push(
        `<div class="ctx-label">📊 Assertions Verified (Expected vs Actual):</div><div class="assn-wrap"><div class="assn-sum">${npass}/${assertions.length} passed</div>${items}</div>`
      );
    }

    if (!passed && test.failureMessages.length) {
      const msg = test.failureMessages.join('\n\n').replace(/\[[0-9;]*m/g, ''); // strip ANSI
      rows.push(
        `<div class="ctx-label">❌ Expected vs Actual (failure):</div><pre class="ctx-pre bad-pre">${esc(msg)}</pre>`
      );
    }

    if (cap) {
      rows.push(`<div class="ctx-label">\u{1F4E6} SDK Method Tested:</div><pre class="ctx-pre">${esc(cap.sdkMethod)}</pre>`);
      rows.push(
        `<div class="ctx-label">\u{1F4E1} API Request:</div><pre class="ctx-pre">${esc(`${cap.method} ${cap.url} [${cap.status == null ? 'no response' : cap.status}]`)}</pre>`
      );
      rows.push(`<div class="ctx-label">\u{1F4CB} cURL Command (copy-paste ready):</div><pre class="ctx-pre curl">${esc(cap.curl)}</pre>`);
      if (cap.requestHeaders && Object.keys(cap.requestHeaders).length) {
        rows.push(`<div class="ctx-label">\u{1F4E4} Request Headers:</div><pre class="ctx-pre">${esc(pretty(cap.requestHeaders))}</pre>`);
      }
      if (cap.responseHeaders && Object.keys(cap.responseHeaders).length) {
        rows.push(`<div class="ctx-label">\u{1F4E5} Response Headers:</div><pre class="ctx-pre">${esc(pretty(cap.responseHeaders))}</pre>`);
      }
      if (cap.responseBody !== undefined && cap.responseBody !== null && cap.responseBody !== '') {
        rows.push(`<div class="ctx-label">\u{1F4E5} Response Body:</div><pre class="ctx-pre">${esc(pretty(cap.responseBody))}</pre>`);
      }
      if (cap.duration != null) {
        rows.push(`<div class="ctx-label">⏱ Duration:</div><div class="ctx-val">${cap.duration}ms</div>`);
      }
    } else {
      rows.push(`<div class="ctx-note">No HTTP call captured for this test.</div>`);
    }
    return `<div class="ctx-head">Additional Test Context</div><div class="ctx">${rows.join('')}</div>`;
  }

  _render(results, byKey, byName, ts) {
    const total = results.numTotalTests || 0;
    const passed = results.numPassedTests || 0;
    const failed = results.numFailedTests || 0;
    const pending = (results.numPendingTests || 0) + (results.numTodoTests || 0);
    const suitesFailed = results.numFailedTestSuites || 0;
    const host = process.env.HOST || '';
    const env = process.env.ENVIRONMENT || '';

    const suiteHtml = this._suites
      .sort((a, b) => a.file.localeCompare(b.file))
      .map((s) => {
        const rel = s.file.replace(process.cwd() + path.sep, '');
        const sPass = s.tests.filter((t) => t.status === 'passed').length;
        const sFail = s.tests.filter((t) => t.status === 'failed').length;
        const sSkip = s.tests.length - sPass - sFail;
        const testsHtml = s.tests
          .map((t) => {
            const rec = byKey[`${s.file}::${t.fullName}`] || byName[t.fullName];
            const icon = t.status === 'passed' ? '✅' : t.status === 'failed' ? '❌' : '⚪';
            const cls = t.status === 'passed' ? 'passed' : t.status === 'failed' ? 'failed' : 'skipped';
            const ancestry = t.ancestorTitles.length ? `<span class="anc">${esc(t.ancestorTitles.join(' › '))}</span> ` : '';
            return `<details class="test ${cls}"${t.status === 'failed' ? ' open' : ''}>
  <summary><span class="ic">${icon}</span>${ancestry}${esc(t.title)}<span class="dur">${t.duration}ms</span></summary>
  ${this._renderContext(rec, t)}
</details>`;
          })
          .join('\n');
        return `<section class="suite">
  <details ${sFail ? 'open' : ''}>
    <summary class="suite-head"><span class="file">${esc(rel)}</span>
      <span class="badges"><span class="b ok">${sPass} passed</span>${sFail ? `<span class="b bad">${sFail} failed</span>` : ''}${sSkip ? `<span class="b skip">${sSkip} skipped</span>` : ''}</span>
    </summary>
    <div class="tests">${testsHtml}</div>
  </details>
</section>`;
      })
      .join('\n');

    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>TS-CDA API Test Report — ${esc(ts)}</title>
<style>
  :root{--bg:#0f1420;--card:#161c2b;--fg:#e6e9ef;--mut:#95a0b5;--ok:#2ecc71;--bad:#ff5c6c;--skip:#f0b429;--line:#26304a;--accent:#7aa2ff}
  @media (prefers-color-scheme:light){:root{--bg:#f4f6fb;--card:#fff;--fg:#1c2330;--mut:#5a6474;--line:#e3e8f2}}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
  .wrap{max-width:1100px;margin:0 auto;padding:24px}
  h1{font-size:20px;margin:0 0 4px}.sub{color:var(--mut);margin-bottom:18px;font-size:13px}
  .summary{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:22px}
  .stat{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px 16px;min-width:96px}
  .stat .n{font-size:22px;font-weight:700}.stat .l{color:var(--mut);font-size:12px;text-transform:uppercase;letter-spacing:.04em}
  .stat.ok .n{color:var(--ok)}.stat.bad .n{color:var(--bad)}.stat.skip .n{color:var(--skip)}
  .suite{background:var(--card);border:1px solid var(--line);border-radius:10px;margin-bottom:12px;overflow:hidden}
  .suite>details>summary,.test>summary{cursor:pointer;list-style:none;padding:12px 16px;display:flex;align-items:center;gap:10px}
  .suite>details>summary::-webkit-details-marker,.test>summary::-webkit-details-marker{display:none}
  .suite-head .file{font-weight:600;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px}
  .badges{margin-left:auto;display:flex;gap:6px}.b{font-size:11px;padding:2px 8px;border-radius:20px;border:1px solid var(--line)}
  .b.ok{color:var(--ok)}.b.bad{color:var(--bad)}.b.skip{color:var(--skip)}
  .tests{padding:0 10px 8px}
  .test{border-top:1px solid var(--line)}.test>summary{padding:9px 8px;font-size:13px}
  .test .ic{width:18px}.test .anc{color:var(--mut)}.test .dur{margin-left:auto;color:var(--mut);font-size:12px}
  .test.failed>summary{color:var(--bad)}
  .ctx-head{padding:6px 8px 2px 34px;color:var(--mut);font-size:11px;text-transform:uppercase;letter-spacing:.06em;font-weight:700}
  .ctx{padding:6px 8px 14px 34px;display:grid;grid-template-columns:max-content 1fr;gap:6px 14px;align-items:start}
  .ctx-label{color:var(--accent);font-weight:600;font-size:12px;white-space:nowrap}
  .ctx-val{font-size:13px}.ctx-val.ok{color:var(--ok)}.ctx-val.bad{color:var(--bad)}
  .ctx-note{color:var(--mut);grid-column:1/-1;font-style:italic}
  .ctx-pre{grid-column:1/-1;margin:0 0 4px;background:rgba(127,127,127,.08);border:1px solid var(--line);border-radius:8px;padding:10px 12px;
    font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;white-space:pre-wrap;word-break:break-word;overflow-x:auto}
  .ctx-pre.curl{background:rgba(122,162,255,.08)}.bad-pre{border-color:var(--bad)}
  .assn-wrap{grid-column:1/-1;margin:0 0 4px}
  .assn-sum{color:var(--mut);font-size:12px;margin-bottom:6px}
  .assn{border-left:3px solid var(--ok);background:rgba(46,204,113,.06);border-radius:6px;padding:6px 10px;margin:0 0 6px}
  .assn.bad{border-left-color:var(--bad);background:rgba(255,92,108,.08)}
  .assn-h{font-size:12px;font-weight:600;margin-bottom:2px}.assn-h .mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
  .assn-kv{display:flex;gap:8px;align-items:flex-start}.assn-kv .k{color:var(--mut);font-size:11px;min-width:64px;padding-top:3px}
  .assn-v{margin:1px 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;white-space:pre-wrap;word-break:break-word;flex:1;overflow-x:auto}
</style></head>
<body><div class="wrap">
  <h1>TS-CDA API Test Report</h1>
  <div class="sub">${esc(ts)}${host ? ' · host: ' + esc(host) : ''}${env ? ' · env: ' + esc(env) : ''}</div>
  <div class="summary">
    <div class="stat"><div class="n">${total}</div><div class="l">Total</div></div>
    <div class="stat ok"><div class="n">${passed}</div><div class="l">Passed</div></div>
    <div class="stat bad"><div class="n">${failed}</div><div class="l">Failed</div></div>
    <div class="stat skip"><div class="n">${pending}</div><div class="l">Skipped</div></div>
    <div class="stat"><div class="n">${this._suites.length}</div><div class="l">Suites${suitesFailed ? ' (' + suitesFailed + ' ❌)' : ''}</div></div>
  </div>
  ${suiteHtml}
</div></body></html>`;
  }
}

module.exports = RichHtmlReporter;
