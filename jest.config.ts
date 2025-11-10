/* eslint-disable */
export default {
  displayName: "contentstack-delivery",
  preset: "./jest.preset.js",
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
    [
      "jest-html-reporters",
      {
        publicPath: "./reports/contentstack-delivery/html",
        filename: "index.html",
        expand: true,
      },
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
  ],
};