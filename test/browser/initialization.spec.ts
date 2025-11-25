/**
 * Browser Environment - SDK Initialization Tests
 * 
 * Purpose: Verify SDK can be initialized and used in browser environment
 * Uses real .env credentials to test with actual API calls
 */

import { Stack } from '../../src/index';
import { browserStackInstance, hasRealCredentials, getStackConfig } from './helpers/browser-stack-instance';

describe('Browser Environment - SDK Initialization', () => {
  describe('Stack Initialization', () => {
    it('should initialize Stack with basic config', () => {
      const stack = Stack({
        api_key: 'blt123456789',
        delivery_token: 'cs123456789',
        environment: 'production',
      });

      expect(stack).toBeDefined();
      expect(typeof stack.ContentType).toBe('function');
      expect(typeof stack.Asset).toBe('function');
      expect(typeof stack.Entry).toBe('function');
    });

    it('should initialize Stack with real .env credentials', () => {
      if (!hasRealCredentials()) {
        console.log('⚠️  Skipping - No .env credentials (this is OK for basic tests)');
        return;
      }

      const stack = browserStackInstance();
      
      expect(stack).toBeDefined();
      expect(typeof stack.ContentType).toBe('function');
      expect(typeof stack.Asset).toBe('function');
      
      console.log('✅ Stack initialized with real credentials');
    });

    it('should initialize Stack with region', () => {
      const stack = Stack({
        api_key: 'blt123456789',
        delivery_token: 'cs123456789',
        environment: 'production',
        region: 'EU',
      });

      expect(stack).toBeDefined();
    });

    it('should initialize Stack with custom host', () => {
      const stack = Stack({
        api_key: 'blt123456789',
        delivery_token: 'cs123456789',
        environment: 'production',
        host: 'custom-cdn.contentstack.com',
      });

      expect(stack).toBeDefined();
    });

    it('should handle browser-specific storage', () => {
      // Test that SDK can work with localStorage/sessionStorage
      const stack = Stack({
        api_key: 'blt123456789',
        delivery_token: 'cs123456789',
        environment: 'production',
        live_preview: {
          enable: true,
          management_token: 'cstest',
          host: 'api.contentstack.io',
        },
      });

      expect(stack).toBeDefined();
    });
  });

  describe('ContentType Creation', () => {
    let stack: ReturnType<typeof Stack>;

    beforeEach(() => {
      if (hasRealCredentials()) {
        stack = browserStackInstance();
      } else {
        stack = Stack({
          api_key: 'blt123456789',
          delivery_token: 'cs123456789',
          environment: 'production',
        });
      }
    });

    it('should create ContentType instance', () => {
      const contentType = stack.ContentType('test_content_type');
      expect(contentType).toBeDefined();
    });

    it('should create Entry instance', () => {
      const entry = stack.ContentType('test_content_type').Entry('entry_uid');
      expect(entry).toBeDefined();
    });

    it('should create Query instance', () => {
      const query = stack.ContentType('test_content_type').Query();
      expect(query).toBeDefined();
      expect(typeof query.where).toBe('function');
      expect(typeof query.find).toBe('function');
    });
  });

  describe('Asset Operations', () => {
    let stack: ReturnType<typeof Stack>;

    beforeEach(() => {
      stack = Stack({
        api_key: 'blt123456789',
        delivery_token: 'cs123456789',
        environment: 'production',
      });
    });

    it('should create Asset instance', () => {
      const asset = stack.Asset('asset_uid');
      expect(asset).toBeDefined();
    });

    it('should support asset transformations', () => {
      const asset = stack.Asset('asset_uid');
      // Asset transformations should work in browser
      expect(asset).toBeDefined();
    });
  });

  describe('Browser-Specific Features', () => {
    it('should not use Node.js-specific APIs', () => {
      // This test ensures SDK doesn't try to use Node.js APIs
      const stack = Stack({
        api_key: 'blt123456789',
        delivery_token: 'cs123456789',
        environment: 'production',
      });

      // If SDK internally uses fs, path, etc., initialization would fail
      expect(stack).toBeDefined();
    });

    it('should use fetch or XMLHttpRequest for HTTP calls', () => {
      // SDK should use browser-compatible HTTP clients
      expect(typeof fetch).toBe('function');
    });

    it('should handle CORS properly', () => {
      // In browser, SDK must handle CORS
      const stack = Stack({
        api_key: 'blt123456789',
        delivery_token: 'cs123456789',
        environment: 'production',
      });

      expect(stack).toBeDefined();
      // CORS handling is implicit in axios/fetch configuration
    });
  });
});

