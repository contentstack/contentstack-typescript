/* eslint-disable */
/**
 * Browser Environment Jest Configuration
 * 
 * Purpose: Test SDK in browser-like environment (jsdom) to catch Node.js-only API usage
 * This configuration will FAIL if code tries to use: fs, path, crypto, etc.
 */
export default {
  displayName: "browser-environment",
  preset: "./jest.preset.js",
  
  // ⚠️ CRITICAL: Use jsdom (browser) instead of node environment
  testEnvironment: "jest-environment-jsdom",
  
  // Only run browser-specific tests
  testMatch: ["**/test/browser/**/*.spec.ts"],
  
  transform: {
    "^.+\\.[tj]s$": [
      "ts-jest",
      {
        tsconfig: {
          // Browser-only libs
          lib: ["dom", "dom.iterable", "es2020"],
          // Include jest types for test files
          types: ["jest", "@types/node"],
          target: "es2020",
          module: "commonjs",
          esModuleInterop: true,
          skipLibCheck: true
        },
        diagnostics: {
          warnOnly: true
        }
      },
    ],
  },
  
  moduleFileExtensions: ["ts", "js", "html"],
  
  // Browser globals (available in jsdom)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.browser.ts'],
  
  // Collect coverage separately for browser tests
  collectCoverage: true,
  coverageDirectory: "./reports/browser-environment/coverage/",
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.spec.ts", "!src/index.ts"],
  
  // Timeout for browser environment tests
  testTimeout: 10000,
  
  // Don't mock Node.js modules globally - let natural browser environment catch issues
  // moduleNameMapper: {},
  
  reporters: [
    "default",
    [
      "jest-html-reporter",
      {
        pageTitle: "Browser Environment Test Report",
        outputPath: "reports/browser-environment/index.html",
        includeFailureMsg: true,
        includeConsoleLog: true,
      },
    ],
  ],
};

