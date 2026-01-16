import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import * as Contentstack from '../../src/lib/contentstack';
import { StackConfig } from '../../src/lib/types';

describe('Retry Integration Tests', () => {
  const baseConfig: StackConfig = {
    apiKey: 'test-api-key',
    deliveryToken: 'test-delivery-token',
    environment: 'test-environment'
  };

  describe('Retry Configuration Integration', () => {
    it('should properly integrate retry configuration with content type queries', () => {
      const config: StackConfig = {
        ...baseConfig,
        retryLimit: 3,
        retryDelay: 100
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      // Verify the configuration is properly set
      expect(client.defaults.retryLimit).toBe(3);
      expect(client.defaults.retryDelay).toBe(100);
      
      // Verify retry interceptors are configured
      expect(client.interceptors.request.handlers.length).toBeGreaterThan(0);
      expect(client.interceptors.response.handlers.length).toBeGreaterThan(0);
    });

    it('should maintain retry configuration across different query types', () => {
      const config: StackConfig = {
        ...baseConfig,
        retryLimit: 2,
        retryDelay: 50
      };

      const stack = Contentstack.stack(config);
      
      // Test different query types use the same client with retry config
      const contentTypeQuery = stack.contentType();
      const assetQuery = stack.asset();
      const taxonomyQuery = stack.taxonomy();
      
      expect(contentTypeQuery).toBeDefined();
      expect(assetQuery).toBeDefined();
      expect(taxonomyQuery).toBeDefined();
      
      // All should use the same client with retry configuration
      const client = stack.getClient();
      expect(client.defaults.retryLimit).toBe(2);
      expect(client.defaults.retryDelay).toBe(50);
    });
  });

  describe('Advanced Retry Configuration', () => {
    it('should support custom retry conditions', () => {
      const customRetryCondition = (error: any) => {
        return error.response?.status === 500;
      };

      const config: StackConfig = {
        ...baseConfig,
        retryLimit: 2,
        retryDelay: 100,
        retryCondition: customRetryCondition
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      expect(client.defaults.retryCondition).toBe(customRetryCondition);
      expect(typeof client.defaults.retryCondition).toBe('function');
    });

    it('should support timeout configuration along with retry settings', () => {
      const config: StackConfig = {
        ...baseConfig,
        retryLimit: 2,
        retryDelay: 100,
        timeout: 5000
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      expect(client.defaults.retryLimit).toBe(2);
      expect(client.defaults.retryDelay).toBe(100);
      expect(client.defaults.timeout).toBe(5000);
    });

    it('should maintain consistency between stack config and client defaults', () => {
      const config: StackConfig = {
        ...baseConfig,
        retryLimit: 5,
        retryDelay: 300,
        retryOnError: true
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      // Verify consistency between stack config and client defaults
      expect(stack.config.retryLimit).toBe(client.defaults.retryLimit);
      expect(stack.config.retryDelay).toBe(client.defaults.retryDelay);
      expect(stack.config.retryOnError).toBe(client.defaults.retryOnError);
      
      // Also verify in stackConfig
      expect(client.stackConfig.retryLimit).toBe(client.defaults.retryLimit);
      expect(client.stackConfig.retryDelay).toBe(client.defaults.retryDelay);
      expect(client.stackConfig.retryOnError).toBe(client.defaults.retryOnError);
    });

    it('should verify that retry delay is properly applied in real scenarios', () => {
      const config: StackConfig = {
        ...baseConfig,
        retryLimit: 2,
        retryDelay: 500,
        retryOnError: true
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      // Verify that the retry configuration will be used by the error handler
      expect(client.defaults.retryLimit).toBe(2);
      expect(client.defaults.retryDelay).toBe(500);
      expect(client.defaults.retryOnError).toBe(true);

      // Verify interceptors are configured to handle retries
      expect(client.interceptors.response.handlers.length).toBeGreaterThan(0);
      
      // The actual retry behavior with delay is tested in the core module's unit tests
      // This integration test ensures the configuration is properly passed through
    });
  });
});
