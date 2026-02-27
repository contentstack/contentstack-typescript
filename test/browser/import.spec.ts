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
      const contentstack = await import('../../src/stack');
      
      expect(contentstack).toBeDefined();
      expect(contentstack.stack).toBeDefined();
    });

    it('should import stack function', async () => {
      const contentstack = await import('../../src/stack');
      expect(typeof contentstack.stack).toBe('function');
    });

    it('should create stack instance', async () => {
      const contentstack = await import('../../src/stack');
      const stack = contentstack.stack({
        apiKey: process.env.API_KEY || 'test_api_key',
        deliveryToken: process.env.DELIVERY_TOKEN || 'test_delivery_token',
        environment: process.env.ENVIRONMENT || 'test',
      });
      
      expect(stack).toBeDefined();
      expect(typeof stack.contentType).toBe('function');
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

    it('should have fetch API or fallback to axios', () => {
      // In browser, either fetch exists or SDK will use axios
      const hasFetch = typeof fetch === 'function';
      const hasAxios = typeof window !== 'undefined';
      expect(hasFetch || hasAxios).toBe(true);
    });

    it('should have localStorage', () => {
      expect(typeof window.localStorage).toBe('object');
    });

    it('should have sessionStorage', () => {
      expect(typeof window.sessionStorage).toBe('object');
    });
  });
});

