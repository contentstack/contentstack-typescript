/**
 * Global Jest Setup File
 * 
 * 1. Captures console logs for test reports
 * 2. Suppresses expected SDK validation errors to reduce console noise during tests.
 */
import * as fs from 'fs';
import * as path from 'path';

// Store captured console logs
interface ConsoleLog {
  type: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  timestamp: string;
  testFile?: string;
}

declare global {
  var __CONSOLE_LOGS__: ConsoleLog[];
  var __CURRENT_TEST_FILE__: string;
}

// Initialize global console log storage
global.__CONSOLE_LOGS__ = [];
global.__CURRENT_TEST_FILE__ = '';

// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug
};

// List of expected SDK validation errors to suppress
const expectedErrors = [
  'Invalid key:',                                      // From query.search() validation
  'Invalid value (expected string or number):',       // From query.equalTo() validation
  'Argument should be a String or an Array.',         // From entry/entries.includeReference() validation
  'Invalid fieldUid:',                                 // From asset query validation
];

// Helper to capture and optionally forward console output
function captureConsole(type: 'log' | 'warn' | 'error' | 'info' | 'debug') {
  return (...args: any[]) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    // Store the log
    global.__CONSOLE_LOGS__.push({
      type,
      message,
      timestamp: new Date().toISOString(),
      testFile: global.__CURRENT_TEST_FILE__
    });
    
    // For errors, check if it's expected (suppress if so)
    if (type === 'error') {
      const isExpectedError = expectedErrors.some(pattern => message.includes(pattern));
      if (!isExpectedError) {
        originalConsole[type].apply(console, args);
      }
    } else {
      // Forward other logs normally
      originalConsole[type].apply(console, args);
    }
  };
}

// Override console methods to capture logs
console.log = captureConsole('log');
console.warn = captureConsole('warn');
console.error = captureConsole('error');
console.info = captureConsole('info');
console.debug = captureConsole('debug');

// After all tests complete, write logs to file
afterAll(() => {
  const logsPath = path.resolve(__dirname, 'test-results', 'console-logs.json');
  const logsDir = path.dirname(logsPath);
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Append to existing logs (in case of multiple test files)
  let existingLogs: ConsoleLog[] = [];
  if (fs.existsSync(logsPath)) {
    try {
      existingLogs = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
    } catch {
      existingLogs = [];
    }
  }
  
  const allLogs = [...existingLogs, ...global.__CONSOLE_LOGS__];
  fs.writeFileSync(logsPath, JSON.stringify(allLogs, null, 2));
  
  // Clear for next file
  global.__CONSOLE_LOGS__ = [];
});

