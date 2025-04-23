import pkg from '@slack/bolt';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const { App } = pkg;
dotenv.config();

const user1 = process.env.USER1;
const user2 = process.env.USER2;
const user3 = process.env.USER3;
const user4 = process.env.USER4;

const reportPath = path.resolve('reports/sanity.html');
const reportHtml = fs.readFileSync(reportPath, 'utf8');
const dom = new JSDOM(reportHtml);
const document = dom.window.document;

const totalTests = document.querySelector('#test-summary .summary-total')?.textContent?.match(/\d+/)?.[0] || '0';
const passedTests = document.querySelector('#test-summary .summary-passed')?.textContent?.match(/\d+/)?.[0] || '0';
const failedTests = document.querySelector('#test-summary .summary-failed')?.textContent?.match(/\d+/)?.[0] || '0';

const durationElements = document.querySelectorAll('.suite-time');
let totalDurationInSeconds = 0;

durationElements.forEach(element => {
  const timeText = element.textContent?.trim() || '0s';
  const timeValue = parseFloat(timeText.replace(/[^\d.]/g, ''));
  if (timeText.includes('m')) {
    totalDurationInSeconds += timeValue * 60;
  } else {
    totalDurationInSeconds += timeValue;
  }
});

const totalDurationMinutes = Math.floor(totalDurationInSeconds / 60);
const totalDurationSeconds = Math.floor(totalDurationInSeconds % 60);

const resultMessage =
  parseInt(passedTests) === parseInt(totalTests)
    ? `:white_check_mark: Success (${passedTests} / ${totalTests} Passed)`
    : `:x: Failure (${passedTests} / ${totalTests} Passed)`;

const pipelineName = process.env.GO_PIPELINE_NAME;
const pipelineCounter = process.env.GO_PIPELINE_COUNTER;
const goCdServer = process.env.GOCD_SERVER;

const reportUrl = `http://${goCdServer}/go/files/${pipelineName}/${pipelineCounter}/sanity/1/unit-api/test-results/reports/sanity.html`;

const tagUsers = parseInt(failedTests) > 0 ? `<@${user1}> <@${user2}> <@${user3}> <@${user4}>` : "";

const slackMessage = {
  text: `*Dev11, SDK-Typescript-CDA Sanity*\n*Result:* ${resultMessage}, ${totalDurationMinutes}m ${totalDurationSeconds}s\n*Failed Tests:* ${failedTests}\n<${reportUrl}|View Report>\n${tagUsers}`,
};

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const sendSlackMessage = async (message) => {
  try {
    const result = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: process.env.SLACK_CHANNEL2,
      text: message,
    });

    if (parseInt(failedTests) > 0) {
      await sendFailureDetails(result.ts);
    }
  } catch (error) {
    console.error("Error sending Slack message:", error);
  }
};

const sendFailureDetails = async (threadTs) => {
  let failureDetails = "*Failed Test Modules:*\n";
  
  const failedTestElements = document.querySelectorAll('.test-result.failed');
  const failedSuites = new Set();

  failedTestElements.forEach(element => {
    const suiteName = element.querySelector('.test-suitename')?.textContent;
    if (suiteName) {
      failedSuites.add(suiteName);
    }
  });

  for (const suite of failedSuites) {
    failureDetails += `- *${suite}*: failed\n`;
  }

  try {
    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: process.env.SLACK_CHANNEL2,
      text: failureDetails,
      thread_ts: threadTs,
    });
  } catch (error) {
    console.error("Error sending failure details:", error);
  }
};

sendSlackMessage(slackMessage.text);
