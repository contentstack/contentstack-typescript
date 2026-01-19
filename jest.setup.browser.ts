/**
 * Browser Environment Test Setup
 * 
 * Sets up browser-like globals and polyfills for testing
 */

// jsdom provides fetch natively in newer versions
// No need to import node-fetch

// Suppress expected console errors during tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    // Suppress specific expected errors
    const message = args[0]?.toString() || '';
    if (
      message.includes('Not implemented: HTMLFormElement.prototype.submit') ||
      message.includes('Not implemented: navigation')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    // Suppress specific expected warnings
    const message = args[0]?.toString() || '';
    if (message.includes('jsdom')) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Add custom matchers for browser testing if needed
expect.extend({
  toBeBrowserSafe(received: any) {
    const forbidden = ['fs', 'path', 'crypto', 'Buffer', 'process'];
    const receivedString = JSON.stringify(received);
    
    for (const api of forbidden) {
      if (receivedString.includes(api)) {
        return {
          pass: false,
          message: () => `Expected code to be browser-safe, but found Node.js API: ${api}`,
        };
      }
    }
    
    return {
      pass: true,
      message: () => 'Code is browser-safe',
    };
  },
});

