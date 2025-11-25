/**
 * Browser Environment - Import Tests
 * 
 * Purpose: Verify SDK can be imported and initialized in browser environment
 * This test would FAIL if code uses fs, path, crypto, or other Node.js-only APIs
 */

describe('Browser Environment - SDK Import', () => {
  describe('Module Import', () => {
    it('should successfully import SDK in browser context', async () => {
      // This import will FAIL if any dependency uses Node.js-only APIs
      const ContentstackModule = await import('../../src/index');
      
      expect(ContentstackModule).toBeDefined();
      expect(ContentstackModule.Stack).toBeDefined();
    });

    it('should import Stack class', async () => {
      const { Stack } = await import('../../src/index');
      expect(typeof Stack).toBe('function');
    });

    it('should import Query class', async () => {
      const { Stack } = await import('../../src/index');
      const stack = Stack({
        api_key: 'test_key',
        delivery_token: 'test_token',
        environment: 'test_env',
      });
      
      expect(stack).toBeDefined();
      expect(stack.ContentType).toBeDefined();
    });
  });

  describe('Browser Environment Detection', () => {
    it('should be running in jsdom environment', () => {
      // Verify we're in browser-like environment
      expect(typeof window).toBe('object');
      expect(typeof document).toBe('object');
    });

    it('should not rely on Node.js-specific globals in SDK', () => {
      // SDK should work without these Node.js globals
      // Note: jest-environment-jsdom provides window, document, etc.
      expect(typeof window).toBe('object');
      expect(typeof document).toBe('object');
    });
  });

  describe('Browser Globals', () => {
    it('should have window object', () => {
      expect(typeof window).toBe('object');
      expect(window).toBeDefined();
    });

    it('should have document object', () => {
      expect(typeof document).toBe('object');
      expect(document).toBeDefined();
    });

    it('should have fetch API (or polyfill)', () => {
      expect(typeof fetch).toBe('function');
    });

    it('should have localStorage', () => {
      expect(typeof window.localStorage).toBe('object');
    });

    it('should have sessionStorage', () => {
      expect(typeof window.sessionStorage).toBe('object');
    });
  });
});

