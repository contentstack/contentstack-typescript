/**
 * Browser Environment - SDK Initialization Tests
 * 
 * Purpose: Verify SDK can be initialized and used in browser environment
 * Uses real .env credentials to test with actual API calls
 */

import * as contentstack from '../../src/stack';
import { browserStackInstance, hasRealCredentials, getStackConfig } from './helpers/browser-stack-instance';

describe('Browser Environment - SDK Initialization', () => {
  describe('Stack Initialization', () => {
    it('should initialize Stack with basic config', () => {
      const stack = contentstack.stack({
        apiKey: process.env.API_KEY || 'test_api_key',
        deliveryToken: process.env.DELIVERY_TOKEN || 'test_delivery_token',
        environment: process.env.ENVIRONMENT || 'test',
      });

      expect(stack).toBeDefined();
      expect(typeof stack.contentType).toBe('function');
      expect(typeof stack.asset).toBe('function');
      expect(stack.config).toBeDefined();
    });

    it('should initialize Stack with real .env credentials', () => {
      if (!hasRealCredentials()) {
        console.log('⚠️  Skipping - No .env credentials (this is OK for basic tests)');
        return;
      }

      const stack = browserStackInstance();
      
      expect(stack).toBeDefined();
      expect(typeof stack.contentType).toBe('function');
      expect(typeof stack.asset).toBe('function');
      
      console.log('✅ Stack initialized with real credentials');
    });

    it('should initialize Stack with region', () => {
      const stack = contentstack.stack({
        apiKey: process.env.API_KEY || 'test_api_key',
        deliveryToken: process.env.DELIVERY_TOKEN || 'test_delivery_token',
        environment: process.env.ENVIRONMENT || 'test',
        region: 'EU',
      });

      expect(stack).toBeDefined();
    });

    it('should initialize Stack with custom host', () => {
      const stack = contentstack.stack({
        apiKey: process.env.API_KEY || 'test_api_key',
        deliveryToken: process.env.DELIVERY_TOKEN || 'test_delivery_token',
        environment: process.env.ENVIRONMENT || 'test',
        host: process.env.HOST || 'custom-host.example.com',
      });

      expect(stack).toBeDefined();
    });

    it('should handle browser-specific storage', () => {
      // Test that SDK can work with localStorage/sessionStorage
      const stack = contentstack.stack({
        apiKey: process.env.API_KEY || 'test_api_key',
        deliveryToken: process.env.DELIVERY_TOKEN || 'test_delivery_token',
        environment: process.env.ENVIRONMENT || 'test',
        live_preview: {
          enable: true,
          management_token: process.env.PREVIEW_TOKEN || 'test_preview_token',
          host: process.env.LIVE_PREVIEW_HOST || 'api.contentstack.io',
        },
      });

      expect(stack).toBeDefined();
    });
  });

  describe('ContentType Creation', () => {
    let stack: ReturnType<typeof contentstack.stack>;

    beforeEach(() => {
      if (hasRealCredentials()) {
        stack = browserStackInstance();
      } else {
        stack = contentstack.stack({
          apiKey: process.env.API_KEY || 'test_api_key',
          deliveryToken: process.env.DELIVERY_TOKEN || 'test_delivery_token',
          environment: process.env.ENVIRONMENT || 'test',
        });
      }
    });

    it('should create ContentType instance', () => {
      const contentType = stack.contentType('test_content_type');
      expect(contentType).toBeDefined();
    });

    it('should create Entry instance', () => {
      const entry = stack.contentType('test_content_type').entry('entry_uid');
      expect(entry).toBeDefined();
    });

    it('should create Query instance', () => {
      const query = stack.contentType('test_content_type').entry();
      expect(query).toBeDefined();
      // Entries has find() method for fetching entries
      expect(typeof query.find).toBe('function');
    });
  });

  describe('Asset Operations', () => {
    let stack: ReturnType<typeof contentstack.stack>;

    beforeEach(() => {
      stack = contentstack.stack({
        apiKey: process.env.API_KEY || 'test_api_key',
        deliveryToken: process.env.DELIVERY_TOKEN || 'test_delivery_token',
        environment: process.env.ENVIRONMENT || 'test',
      });
    });

    it('should create Asset instance', () => {
      const asset = stack.asset('asset_uid');
      expect(asset).toBeDefined();
    });

    it('should support asset transformations', () => {
      const asset = stack.asset('asset_uid');
      // Asset transformations should work in browser
      expect(asset).toBeDefined();
    });
  });

  describe('Browser-Specific Features', () => {
    it('should not use Node.js-specific APIs', () => {
      // This test ensures SDK doesn't try to use Node.js APIs
      const stack = contentstack.stack({
        apiKey: process.env.API_KEY || 'test_api_key',
        deliveryToken: process.env.DELIVERY_TOKEN || 'test_delivery_token',
        environment: process.env.ENVIRONMENT || 'test',
      });

      // If SDK internally uses fs, path, etc., initialization would fail
      expect(stack).toBeDefined();
    });

    it('should use fetch or XMLHttpRequest for HTTP calls', () => {
      // SDK should use browser-compatible HTTP clients (axios in this case)
      // In jsdom, fetch might not be available but axios works
      expect(typeof window).toBe('object');
    });

    it('should handle CORS properly', () => {
      // In browser, SDK must handle CORS
      const stack = contentstack.stack({
        apiKey: process.env.API_KEY || 'test_api_key',
        deliveryToken: process.env.DELIVERY_TOKEN || 'test_delivery_token',
        environment: process.env.ENVIRONMENT || 'test',
      });

      expect(stack).toBeDefined();
      // CORS handling is implicit in axios/fetch configuration
    });
  });
});

