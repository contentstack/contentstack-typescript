/**
 * Legacy sanity report script (TS SDK Slack notification).
 * Run from repo root: node scripts/sanity-report-ts-sdk.js
 */
const fs = require("fs");
const { App } = require("@slack/bolt");
const { JSDOM } = require("jsdom");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const user1 = process.env.USER1;
const user2 = process.env.USER2;
const user3 = process.env.USER3;
const user4 = process.env.USER4;

const reportPath = path.join(__dirname, "..", "reports", "sanity.html");
const data = fs.readFileSync(reportPath, "utf8");
const dom = new JSDOM(data);

const textarea = dom.window.document.querySelector("#jest-html-reports-result-data");
const testResults = JSON.parse(textarea.textContent.trim());

const startTime = testResults.startTime;
const endTime = Math.max(...testResults.testResults.map(t => t.perfStats.end));
const totalSeconds = (endTime - startTime) / 1000;
const minutes = Math.floor(totalSeconds / 60);
const seconds = (totalSeconds % 60).toFixed(2);
const duration = `${minutes}m ${seconds}s`;

const summary = {
  totalSuites: testResults.numTotalTestSuites,
  passedSuites: testResults.numPassedTestSuites,
  failedSuites: testResults.numFailedTestSuites,
  totalTests: testResults.numTotalTests,
  passedTests: testResults.numPassedTests,
  failedTests: testResults.numFailedTests,
  skippedTests: testResults.numPendingTests + testResults.numTodoTests,
  pendingTests: testResults.numPendingTests,
  duration: duration,
};

const resultMessage =
  summary.passedTests === summary.totalTests
    ? `:white_check_mark: Success (${summary.passedTests} / ${summary.totalTests} Passed)`
    : `:x: Failure (${summary.passedTests} / ${summary.totalTests} Passed)`;

// Static path message — local or remote can be set up
const reportPathMessage = `_(Report: \`reports/sanity.html\`)`;

let tagUsers = "";
if (summary.failedTests > 0) {
  tagUsers = `<@${user1}> <@${user2}> <@${user3}> <@${user4}>`;
}

const slackMessage = {
  text: `*Dev11 - SDK-Typescript-CDA Sanity*\n*Result:* ${resultMessage}\n*Duration:* ${summary.duration}\n*Failed Tests:* ${summary.failedTests + summary.skippedTests}\n${reportPathMessage}\n${tagUsers}`,
};

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const sendSlackMessage = async () => {
  try {
    const result = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: process.env.SLACK_CHANNEL2,
      text: slackMessage.text,
    });

    if (summary.failedTests > 0) {
      await sendFailureDetails(result.ts);
    }
  } catch (error) {
    console.error("❌ Error sending Slack message:", error);
  }
};

const sendFailureDetails = async (threadTs) => {
  const failedTestSuites = testResults.testResults.filter(
    (suite) => suite.numFailingTests > 0
  );

  if (failedTestSuites.length > 0) {
    let failureDetails = "*Failed Test Modules:*\n";
    for (const suite of failedTestSuites) {
      let modulePath = suite.testFilePath;
      let formattedModuleName = path
        .relative(path.join(__dirname, ".."), modulePath)
        .replace(/^test\//, "")
        .replace(/\.ts$/, "")
        .replace(/\//g, " ");
      failureDetails += ` - ${formattedModuleName}: ${suite.numFailingTests} failed\n`;
    }

    try {
      await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: process.env.SLACK_CHANNEL2,
        text: failureDetails,
        thread_ts: threadTs,
      });
    } catch (error) {
      console.error("❌ Error sending failure details:", error);
    }
  }
};

sendSlackMessage();
