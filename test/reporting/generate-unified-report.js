#!/usr/bin/env node
/**
 * Generate Unified Test Report for GOCD Pipeline
 * 
 * Combines results from:
 * 1. API Tests (Jest)
 * 2. Bundler Tests (Shell scripts)
 * 3. Browser Tests (Playwright)
 * 
 * Outputs:
 * - JSON summary (test-results/combined-report.json)
 * - HTML report (test-results/index.html)
 * - JUnit XML (test-results/junit.xml) for GOCD
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESULTS_DIR = path.resolve(__dirname, '../../test-results');
const OUTPUT_FILE = path.join(RESULTS_DIR, 'combined-report.json');
const HTML_FILE = path.join(RESULTS_DIR, 'index.html');
const JUNIT_FILE = path.join(RESULTS_DIR, 'junit.xml');

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

/**
 * Read Jest results (API tests)
 */
function readJestResults() {
  const jestResultsPath = path.join(RESULTS_DIR, 'jest-results.json');
  
  if (!fs.existsSync(jestResultsPath)) {
    console.warn('⚠️  Jest results not found, skipping API tests');
    return null;
  }
  
  try {
    const results = JSON.parse(fs.readFileSync(jestResultsPath, 'utf8'));
    
    // Extract detailed test cases
    const details = results.testResults?.map(suite => {
      const testCases = suite.assertionResults?.map(test => {
        const fullName = test.ancestorTitles?.length > 0
          ? `${test.ancestorTitles.join(' › ')} › ${test.title}`
          : test.title;
        return {
          name: fullName || test.title,
          status: test.status,
          duration: test.duration || 0,
          failureMessages: test.failureMessages || [],
          failureDetails: test.failureDetails || []
        };
      }) || [];
      
      // Calculate counts from assertionResults (numPassingTests etc. are often null)
      const totalTests = testCases.length;
      const passedTests = testCases.filter(tc => tc.status === 'passed').length;
      const failedTests = testCases.filter(tc => tc.status === 'failed').length;
      const skippedTests = testCases.filter(tc => tc.status === 'pending' || tc.status === 'skipped').length;
      
      return {
        file: suite.name,
        tests: totalTests,
        passed: passedTests,
        failed: failedTests,
        skipped: skippedTests,
        duration: suite.perfStats?.runtime || 0,
        testCases  // Individual test case details
      };
    }) || [];
    
    return {
      name: 'API Tests (Jest)',
      total: results.numTotalTests || 0,
      passed: results.numPassedTests || 0,
      failed: results.numFailedTests || 0,
      skipped: results.numPendingTests || 0,
      duration: results.testResults?.reduce((sum, r) => sum + (r.perfStats?.runtime || 0), 0) || 0,
      success: results.success || false,
      details
    };
  } catch (error) {
    console.error('❌ Failed to read Jest results:', error.message);
    return null;
  }
}

/**
 * Read Bundler test results
 */
function readBundlerResults() {
  const bundlerResultsPath = path.join(RESULTS_DIR, 'bundler-results.json');
  
  if (!fs.existsSync(bundlerResultsPath)) {
    console.warn('⚠️  Bundler results not found, skipping bundler tests');
    return null;
  }
  
  try {
    const content = fs.readFileSync(bundlerResultsPath, 'utf8');
    const results = JSON.parse(content);
    
    // Calculate totals from bundler details if top-level is 0
    let total = results.total || 0;
    let passed = results.passed || 0;
    let failed = results.failed || 0;
    
    if (total === 0 && results.bundlers && results.bundlers.length > 0) {
      // Sum up from individual bundlers
      results.bundlers.forEach(bundler => {
        total += bundler.total || 0;
        passed += bundler.passed || 0;
        failed += bundler.failed || 0;
      });
    }
    
    return {
      name: 'Bundler Tests',
      total,
      passed,
      failed,
      skipped: 0,
      duration: results.duration || 0,
      success: failed === 0 && total > 0,
      details: results.bundlers || []
    };
  } catch (error) {
    console.error('❌ Failed to read Bundler results:', error.message);
    console.error('   File path:', bundlerResultsPath);
    return null;
  }
}

/**
 * Read Playwright results (Browser tests)
 */
function readPlaywrightResults() {
  const playwrightResultsPath = path.join(RESULTS_DIR, 'playwright-results.json');
  
  if (!fs.existsSync(playwrightResultsPath)) {
    console.warn('⚠️  Playwright results not found, skipping browser tests');
    return null;
  }
  
  // Check if it's a directory (error case)
  const stats = fs.statSync(playwrightResultsPath);
  if (stats.isDirectory()) {
    console.warn('⚠️  Playwright results is a directory, not a file. Skipping browser tests.');
    return null;
  }
  
  try {
    const content = fs.readFileSync(playwrightResultsPath, 'utf8');
    const results = JSON.parse(content);
    
    // Use stats from Playwright report
    const stats = results.stats || {};
    const total = (stats.expected || 0) + (stats.skipped || 0) + (stats.unexpected || 0);
    const passed = stats.expected || 0;
    const failed = stats.unexpected || 0;
    const skipped = stats.skipped || 0;
    
    // Extract suite details
    const suites = results.suites || [];
    const details = [];
    
    suites.forEach(suite => {
      if (suite.suites) {
        suite.suites.forEach(subsuite => {
          const specs = subsuite.specs || [];
          details.push({
            file: subsuite.title,
            tests: specs.length,
            passed: specs.filter(s => s.ok && s.tests?.[0]?.status !== 'skipped').length,
            failed: specs.filter(s => !s.ok).length,
            duration: specs.reduce((sum, s) => sum + (s.tests?.[0]?.results?.[0]?.duration || 0), 0)
          });
        });
      }
    });
    
    return {
      name: 'Browser Tests (Playwright)',
      total,
      passed,
      failed,
      skipped,
      duration: results.stats?.duration || 0,
      success: failed === 0 && total > 0,
      details
    };
  } catch (error) {
    console.error('❌ Failed to read Playwright results:', error.message);
    return null;
  }
}

/**
 * Generate combined JSON report
 */
function generateJSONReport(apiResults, bundlerResults, browserResults) {
  const allResults = [apiResults, bundlerResults, browserResults].filter(Boolean);
  
  const combined = {
    timestamp: new Date().toISOString(),
    summary: {
      total: allResults.reduce((sum, r) => sum + r.total, 0),
      passed: allResults.reduce((sum, r) => sum + r.passed, 0),
      failed: allResults.reduce((sum, r) => sum + r.failed, 0),
      skipped: allResults.reduce((sum, r) => sum + r.skipped, 0),
      duration: allResults.reduce((sum, r) => sum + r.duration, 0),
      success: allResults.every(r => r.success)
    },
    testSuites: allResults,
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(combined, null, 2));
  console.log(`✅ JSON report saved: ${OUTPUT_FILE}`);
  
  return combined;
}

/**
 * Generate details HTML - expandable for API tests, simple table for others
 */
function generateDetailsHTML(suiteName, details) {
  const isAPITests = suiteName === 'API Tests (Jest)';
  const hasTestCases = details[0]?.testCases && details[0].testCases.length > 0;
  
  if (isAPITests && hasTestCases) {
    // Expandable sections for API tests
    return `
      <div class="details">
        <div class="expand-controls">
          <button class="expand-btn expand-all" onclick="expandAll()">Expand All</button>
          <button class="expand-btn collapse-all" onclick="collapseAll()">Collapse All</button>
        </div>
        ${details.map((detail, idx) => {
          const fileName = detail.file ? detail.file.replace(/.*\/test\/api\//, '') : 'Unknown';
          const totalTests = detail.testCases?.length || 0;
          const passedTests = detail.testCases?.filter(tc => tc.status === 'passed').length || 0;
          const failedTests = detail.testCases?.filter(tc => tc.status === 'failed').length || 0;
          
          return `
        <div class="expandable-suite">
          <div class="suite-summary" onclick="toggleTestCases(event, '${idx}')">
            <div>
              <span class="expand-icon" id="icon-${idx}">▶</span>
              <strong>${escapeHtml(fileName)}</strong>
            </div>
            <div><strong>${totalTests}</strong> tests</div>
            <div style="color: #27ae60"><strong>${passedTests}</strong> passed</div>
            <div style="color: #e74c3c"><strong>${failedTests}</strong> failed</div>
            <div><strong>${detail.duration ? (detail.duration / 1000).toFixed(2) + 's' : 'N/A'}</strong></div>
          </div>
          <div class="test-cases" id="cases-${idx}">
            <div class="test-case-row header">
              <div>Test Name</div>
              <div>Status</div>
              <div>Duration</div>
            </div>
            ${detail.testCases?.map((tc, tcIdx) => `
            <div class="test-case-row ${tc.status === 'failed' ? 'failed-test' : ''}">
              <div>
                ${escapeHtml(tc.name || 'Unknown')}
                ${tc.status === 'failed' && tc.failureMessages?.length > 0 ? `
                <div class="error-toggle" onclick="toggleError(event, '${idx}-${tcIdx}')">
                  <span class="error-icon">⚠️</span> Show Error
                </div>
                <div class="error-details" id="error-${idx}-${tcIdx}">
                  <pre>${escapeHtml(tc.failureMessages.join('\n\n'))}</pre>
                </div>
                ` : ''}
              </div>
              <div><span class="test-status ${tc.status}">${tc.status}</span></div>
              <div>${tc.duration ? (tc.duration / 1000).toFixed(3) + 's' : 'N/A'}</div>
            </div>
            `).join('') || ''}
          </div>
        </div>
          `;
        }).join('')}
      </div>
    `;
  } else {
    // Simple table for bundler/browser tests
    return `
      <div class="details">
        <div class="details-row">
          <div>Test Suite</div>
          <div>Total</div>
          <div>Passed</div>
          <div>Failed</div>
          <div>Duration</div>
        </div>
        ${details.map(detail => `
        <div class="details-row">
          <div>${escapeHtml(detail.file || detail.bundler || detail.name || 'Unknown')}</div>
          <div>${detail.tests || detail.total || 0}</div>
          <div style="color: #27ae60">${detail.passed || 0}</div>
          <div style="color: #e74c3c">${detail.failed || 0}</div>
          <div>${detail.duration ? (detail.duration / 1000).toFixed(2) + 's' : 'N/A'}</div>
        </div>
        `).join('')}
      </div>
    `;
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate HTML report
 */
function generateHTMLReport(combined) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contentstack SDK Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f7fa;
      color: #2c3e50;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    .header .subtitle {
      opacity: 0.9;
      font-size: 14px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 30px;
      background: #fafafa;
      border-bottom: 1px solid #e0e0e0;
    }
    .stat {
      text-align: center;
      padding: 20px;
      background: white;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat .number {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .stat .label {
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      letter-spacing: 0.5px;
    }
    .stat.total .number { color: #3498db; }
    .stat.passed .number { color: #27ae60; }
    .stat.failed .number { color: #e74c3c; }
    .stat.skipped .number { color: #f39c12; }
    .stat.duration .number { font-size: 24px; }
    .suite {
      padding: 30px;
      border-bottom: 1px solid #e0e0e0;
    }
    .suite:last-child { border-bottom: none; }
    .suite-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .suite-title {
      font-size: 20px;
      font-weight: 600;
    }
    .suite-badge {
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .suite-badge.success {
      background: #d4edda;
      color: #155724;
    }
    .suite-badge.failure {
      background: #f8d7da;
      color: #721c24;
    }
    .suite-stats {
      display: flex;
      gap: 30px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .suite-stats span {
      color: #666;
    }
    .suite-stats strong {
      color: #2c3e50;
    }
    .details {
      background: #fafafa;
      border-radius: 4px;
      padding: 15px;
    }
    .details-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      padding: 10px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 13px;
    }
    .details-row:first-child {
      font-weight: 600;
      background: #f0f0f0;
      border-radius: 4px 4px 0 0;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .footer {
      padding: 20px 30px;
      background: #fafafa;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .status-icon {
      display: inline-block;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      font-size: 30px;
      line-height: 60px;
      text-align: center;
      margin-bottom: 15px;
    }
    .status-icon.success {
      background: #d4edda;
      color: #155724;
    }
    .status-icon.failure {
      background: #f8d7da;
      color: #721c24;
    }
    .overall-status {
      text-align: center;
      padding: 40px 30px;
      background: #fafafa;
      border-bottom: 1px solid #e0e0e0;
    }
    .overall-status h2 {
      font-size: 24px;
      margin-top: 10px;
    }
    
    /* Expandable test cases styles */
    .expandable-suite {
      cursor: pointer;
      user-select: none;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      margin-bottom: 8px;
      overflow: hidden;
    }
    .expandable-suite:hover {
      background: #f8f9fa;
    }
    .suite-summary {
      padding: 12px 15px;
      display: grid;
      grid-template-columns: 3fr 1fr 1fr 1fr 1fr;
      font-size: 13px;
      background: #fafafa;
    }
    .expand-icon {
      display: inline-block;
      margin-right: 8px;
      transition: transform 0.2s;
      font-size: 11px;
      color: #666;
    }
    .expand-icon.expanded {
      transform: rotate(90deg);
    }
    .test-cases {
      display: none;
      background: white;
    }
    .test-cases.visible {
      display: block;
    }
    .test-case-row {
      display: grid;
      grid-template-columns: 3fr 1fr 1fr;
      padding: 10px 15px;
      border-top: 1px solid #f0f0f0;
      font-size: 12px;
    }
    .test-case-row:hover {
      background: #f8f9fa;
    }
    .test-case-row.header {
      background: #f0f0f0;
      font-weight: 600;
      color: #666;
      font-size: 11px;
      text-transform: uppercase;
    }
    .test-case-row.header:hover {
      background: #f0f0f0;
    }
    .test-case-row.failed-test {
      background: #fff5f5;
      border-left: 3px solid #e74c3c;
    }
    .error-toggle {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 10px;
      background: #e74c3c;
      color: white;
      border-radius: 3px;
      font-size: 11px;
      cursor: pointer;
      user-select: none;
    }
    .error-toggle:hover {
      background: #c0392b;
    }
    .error-icon {
      font-size: 12px;
    }
    .error-details {
      display: none;
      margin-top: 10px;
      padding: 12px;
      background: #2c3e50;
      color: #ecf0f1;
      border-radius: 4px;
      font-size: 11px;
      max-height: 300px;
      overflow-y: auto;
    }
    .error-details.visible {
      display: block;
    }
    .error-details pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
      line-height: 1.5;
    }
    .test-status {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .test-status.passed {
      background: #d4edda;
      color: #155724;
    }
    .test-status.failed {
      background: #f8d7da;
      color: #721c24;
    }
    .test-status.skipped {
      background: #fff3cd;
      color: #856404;
    }
    .expand-controls {
      margin-bottom: 12px;
      display: flex;
      gap: 8px;
    }
    .expand-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      color: white;
      transition: opacity 0.2s;
    }
    .expand-btn:hover {
      opacity: 0.8;
    }
    .expand-btn.expand-all {
      background: #667eea;
    }
    .expand-btn.collapse-all {
      background: #95a5a6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 Contentstack SDK Test Report</h1>
      <div class="subtitle">Generated on ${new Date(combined.timestamp).toLocaleString()}</div>
    </div>
    
    <div class="overall-status">
      <div class="status-icon ${combined.summary.success ? 'success' : 'failure'}">
        ${combined.summary.success ? '✓' : '✗'}
      </div>
      <h2>${combined.summary.success ? 'All Tests Passed ✅' : 'Some Tests Failed ❌'}</h2>
    </div>
    
    <div class="summary">
      <div class="stat total">
        <div class="number">${combined.summary.total}</div>
        <div class="label">Total Tests</div>
      </div>
      <div class="stat passed">
        <div class="number">${combined.summary.passed}</div>
        <div class="label">Passed</div>
      </div>
      <div class="stat failed">
        <div class="number">${combined.summary.failed}</div>
        <div class="label">Failed</div>
      </div>
      <div class="stat skipped">
        <div class="number">${combined.summary.skipped}</div>
        <div class="label">Skipped</div>
      </div>
      <div class="stat duration">
        <div class="number">${(combined.summary.duration / 1000).toFixed(2)}s</div>
        <div class="label">Duration</div>
      </div>
    </div>
    
    ${combined.testSuites.map(suite => `
    <div class="suite">
      <div class="suite-header">
        <div class="suite-title">${suite.name}</div>
        <div class="suite-badge ${suite.success ? 'success' : 'failure'}">
          ${suite.success ? 'Passed' : 'Failed'}
        </div>
      </div>
      <div class="suite-stats">
        <span>Total: <strong>${suite.total}</strong></span>
        <span>Passed: <strong style="color: #27ae60">${suite.passed}</strong></span>
        <span>Failed: <strong style="color: #e74c3c">${suite.failed}</strong></span>
        ${suite.skipped > 0 ? `<span>Skipped: <strong style="color: #f39c12">${suite.skipped}</strong></span>` : ''}
        <span>Duration: <strong>${(suite.duration / 1000).toFixed(2)}s</strong></span>
      </div>
      ${suite.details && suite.details.length > 0 ? 
        generateDetailsHTML(suite.name, suite.details) : ''}
    </div>
    `).join('')}
    
    <div class="footer">
      <div><strong>Environment:</strong> Node ${combined.environment.node} | ${combined.environment.platform} (${combined.environment.arch})</div>
      <div style="margin-top: 10px;">Generated by Contentstack SDK Test Suite</div>
    </div>
  </div>
  
  <script>
    function toggleTestCases(event, suiteId) {
      event.stopPropagation();
      const testCases = document.getElementById('cases-' + suiteId);
      const icon = document.getElementById('icon-' + suiteId);
      
      if (testCases) {
        testCases.classList.toggle('visible');
        icon.classList.toggle('expanded');
      }
    }
    
    function expandAll() {
      document.querySelectorAll('.test-cases').forEach(el => el.classList.add('visible'));
      document.querySelectorAll('.expand-icon').forEach(el => el.classList.add('expanded'));
    }
    
    function collapseAll() {
      document.querySelectorAll('.test-cases').forEach(el => el.classList.remove('visible'));
      document.querySelectorAll('.expand-icon').forEach(el => el.classList.remove('expanded'));
    }
    
    function toggleError(event, errorId) {
      event.stopPropagation();
      const errorDiv = document.getElementById('error-' + errorId);
      const toggleBtn = event.target.closest('.error-toggle');
      
      if (errorDiv) {
        const isVisible = errorDiv.classList.toggle('visible');
        if (toggleBtn) {
          toggleBtn.innerHTML = isVisible 
            ? '<span class="error-icon">⚠️</span> Hide Error' 
            : '<span class="error-icon">⚠️</span> Show Error';
        }
      }
    }
  </script>
</body>
</html>`;
  
  fs.writeFileSync(HTML_FILE, html);
  console.log(`✅ HTML report saved: ${HTML_FILE}`);
}

/**
 * Generate JUnit XML for GOCD
 */
function generateJUnitXML(combined) {
  const escapeXML = (str) => {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites 
  name="Contentstack SDK Tests" 
  tests="${combined.summary.total}" 
  failures="${combined.summary.failed}" 
  skipped="${combined.summary.skipped}" 
  time="${(combined.summary.duration / 1000).toFixed(3)}">
${combined.testSuites.map(suite => `
  <testsuite 
    name="${escapeXML(suite.name)}" 
    tests="${suite.total}" 
    failures="${suite.failed}" 
    skipped="${suite.skipped}" 
    time="${(suite.duration / 1000).toFixed(3)}">
${suite.details?.map(detail => `
    <testcase 
      name="${escapeXML(detail.file || detail.bundler || detail.name || 'Unknown')}" 
      classname="${escapeXML(suite.name)}" 
      time="${detail.duration ? (detail.duration / 1000).toFixed(3) : '0'}">
${detail.failed > 0 ? `      <failure message="Test failed">Failed tests: ${detail.failed}</failure>` : ''}
    </testcase>`).join('') || ''}
  </testsuite>`).join('')}
</testsuites>`;
  
  fs.writeFileSync(JUNIT_FILE, xml);
  console.log(`✅ JUnit XML saved: ${JUNIT_FILE}`);
}

/**
 * Main function
 */
function main() {
  console.log('📊 Generating unified test report...\n');
  
  const apiResults = readJestResults();
  const bundlerResults = readBundlerResults();
  const browserResults = readPlaywrightResults();
  
  if (!apiResults && !bundlerResults && !browserResults) {
    console.error('❌ No test results found! Please run tests first.');
    process.exit(1);
  }
  
  const combined = generateJSONReport(apiResults, bundlerResults, browserResults);
  generateHTMLReport(combined);
  generateJUnitXML(combined);
  
  console.log('\n════════════════════════════════════════');
  console.log('  📊 Test Report Summary');
  console.log('════════════════════════════════════════');
  console.log(`Total Tests:    ${combined.summary.total}`);
  console.log(`✅ Passed:      ${combined.summary.passed}`);
  console.log(`❌ Failed:      ${combined.summary.failed}`);
  console.log(`⏭️  Skipped:     ${combined.summary.skipped}`);
  console.log(`⏱️  Duration:    ${(combined.summary.duration / 1000).toFixed(2)}s`);
  console.log(`Status:         ${combined.summary.success ? '✅ SUCCESS' : '❌ FAILURE'}`);
  console.log('════════════════════════════════════════\n');
  
  console.log('📁 Reports generated:');
  console.log(`   • JSON:  ${OUTPUT_FILE}`);
  console.log(`   • HTML:  ${HTML_FILE}`);
  console.log(`   • JUnit: ${JUNIT_FILE}`);
  console.log('');
  
  // Exit with appropriate code for GOCD
  process.exit(combined.summary.success ? 0 : 1);
}

main();

