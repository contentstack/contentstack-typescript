import pkg from '@slack/bolt';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

dotenv.config();

const { App } = pkg;

const reportPath = path.resolve('reports/sanity.html');
const reportHtml = fs.readFileSync(reportPath, 'utf-8');
const dom = new JSDOM(reportHtml);
const document = dom.window.document;

const totalSuites = document.querySelector('#suite-summary .summary-total')?.textContent?.match(/\d+/)?.[0] || '0';
const totalTests = document.querySelector('#test-summary .summary-total')?.textContent?.match(/\d+/)?.[0] || '0';
const passedTests = document.querySelector('#test-summary .summary-passed')?.textContent?.match(/\d+/)?.[0] || '0';
const failedSuits = document.querySelector('#suite-summary .summary-failed')?.textContent?.match(/\d+/)?.[0] || '0';
const failedTests = document.querySelector('#test-summary .summary-failed')?.textContent?.match(/\d+/)?.[0] || '0';
const skippedTests = document.querySelector('#test-summary .summary-skipped')?.textContent?.match(/\d+/)?.[0] || '0';

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
const totalDurationSeconds = (totalDurationInSeconds % 60);

console.log(`Total Suites: ${totalSuites}`);
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed Tests: ${passedTests}`);
console.log(`Failed Suits: ${failedSuits}`);
console.log(`Failed Tests: ${failedTests}`);
console.log(`Skipped Tests: ${skippedTests}`);
console.log(`Total Duration: ${totalDurationMinutes}m ${totalDurationSeconds.toFixed(0)}s`);

const slackMessage = `
*Typescript CDA Report*
• Total Suites: *${totalSuites}*
• Total Tests: *${totalTests}*
• Passed Tests: *${passedTests}*
• Failed Suits: *${failedSuits}*
• Failed Tests: *${failedTests}*
• Skipped Tests: *${skippedTests}*
• Total Duration: * ${totalDurationMinutes}m ${totalDurationSeconds.toFixed(0)}s*
`;

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

async function publishMessage(text, report) {
  await app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: process.env.SLACK_CHANNEL,
    text: text
  });
  await app.client.files.uploadV2({
    token: process.env.SLACK_BOT_TOKEN,
    channel_id: process.env.SLACK_CHANNEL_ID,
    initial_comment: '*Here is the report generated*',
    filename: 'TS-sanity-report.html',
    file: fs.createReadStream(report)
  });
}

publishMessage(slackMessage, reportPath);