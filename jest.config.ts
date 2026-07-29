/* eslint-disable */
export default {
  displayName: "contentstack-delivery",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.[tj]s$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.spec.json",
      },
    ],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  collectCoverage: true,
  coverageDirectory: "./reports/contentstack-delivery/coverage/",
  collectCoverageFrom: ["src/**", "!src/index.ts"],
  coverageThreshold: {
    // global: {
    //   branches: 95,
    // }
  },
  // Use single worker to avoid circular JSON serialization issues with error objects
  // This prevents "Jest worker encountered 4 child process exceptions" errors
  maxWorkers: 1,
  // Increase timeout for integration tests that may take longer
  testTimeout: 30000,
  // Global setup file to suppress expected SDK validation errors
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  reporters: [
    "default",
    [
      "jest-html-reporter",
      {
        pageTitle: "API Test Report",
        outputPath: "reports/sanity.html",
        includeFailureMsg: true,
        includeConsoleLog: true,
      },
    ],
    // Rich single-file HTML report with inline per-test HTTP context (cURL,
    // SDK method, request/response). Fixed path (the one the GoCD pipelines link to);
    // prints the absolute path at run end.
    [
      "./test/reporting/rich-html-reporter.cjs",
      { outputPath: "reports/contentstack-delivery/html/index.html" },
    ],
    [
      "jest-junit",
      {
        outputDirectory: "reports/contentstack-delivery/junit",
        outputName: "jest-junit.xml",
        ancestorSeparator: " › ",
        uniqueOutputName: "false",
        suiteNameTemplate: "{filepath}",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
      },
    ],
    // JSON reporter to capture console logs for unified report
    [
      "./test/reporting/jest-json-reporter.cjs",
      {
        outputPath: "test-results/jest-results.json",
      },
    ],
  ],
};