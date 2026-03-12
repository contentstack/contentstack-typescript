/**
 * Custom Jest JSON Reporter
 * 
 * Outputs test results to JSON format for unified reporting.
 * Console logs are captured separately via jest.setup.ts
 */

const fs = require('fs');
const path = require('path');

class JsonReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options || {};
    this._outputPath = this._options.outputPath || 'test-results/jest-results.json';
  }

  onRunComplete(contexts, results) {
    // Ensure output directory exists
    const outputDir = path.dirname(this._outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write results with full test details
    fs.writeFileSync(
      this._outputPath,
      JSON.stringify(results, null, 2)
    );

    console.log(`✅ Test results written to: ${this._outputPath}`);
  }
}

module.exports = JsonReporter;

