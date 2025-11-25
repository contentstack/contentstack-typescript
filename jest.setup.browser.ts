/**
 * Browser Environment Test Setup
 * 
 * Sets up browser-like globals and polyfills for testing
 */

// Disable source-map-support in browser tests (uses Node.js fs module)
try {
  // @ts-ignore
  delete require.cache[require.resolve('source-map-support')];
} catch (e) {
  // Ignore if not loaded
}

// Mock fetch if not available in jsdom
if (!global.fetch) {
  const nodeFetch = require('node-fetch');
  global.fetch = nodeFetch as any;
}

// Ensure browser globals are available
if (typeof window !== 'undefined') {
  // Add any browser-specific setup here
  (global as any).window = window;
  (global as any).document = document;
}

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

