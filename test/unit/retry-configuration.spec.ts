import { httpClient, AxiosInstance } from '@contentstack/core';
import * as Contentstack from '../../src/stack';
import { Stack } from '../../src/stack';
import { StackConfig } from '../../src/common/types';
import MockAdapter from 'axios-mock-adapter';

describe('Retry Configuration', () => {
  let mockClient: MockAdapter | undefined;

  afterEach(() => {
    if (mockClient) {
      mockClient.reset();
      mockClient = undefined;
    }
  });

  describe('Default Retry Configuration', () => {
    it('should use default retry settings when not specified', () => {
      const config: StackConfig = {
        apiKey: 'test-api-key',
        deliveryToken: 'test-delivery-token',
        environment: 'test-environment'
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      // Default values should come from core module
      expect(client.defaults.retryOnError).toBe(true);
      // retryLimit and retryDelay should be undefined here and use core defaults (5 and 300)
      expect(client.defaults.retryLimit).toBeUndefined();
      expect(client.defaults.retryDelay).toBeUndefined();
    });

    it('should have retry interceptors configured', () => {
      const config: StackConfig = {
        apiKey: 'test-api-key',
        deliveryToken: 'test-delivery-token',
        environment: 'test-environment'
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      // Should have retry request and response interceptors
      expect(client.interceptors.request.handlers.length).toBeGreaterThan(0);
      expect(client.interceptors.response.handlers.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Retry Configuration', () => {
    it('should accept custom retryLimit configuration', () => {
      const config: StackConfig = {
        apiKey: 'test-api-key',
        deliveryToken: 'test-delivery-token',
        environment: 'test-environment',
        retryLimit: 3
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      expect(client.defaults.retryLimit).toBe(3);
      expect(stack.config.retryLimit).toBe(3);
    });

    it('should accept custom retryDelay configuration', () => {
      const config: StackConfig = {
        apiKey: 'test-api-key',
        deliveryToken: 'test-delivery-token',
        environment: 'test-environment',
        retryDelay: 1000
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      expect(client.defaults.retryDelay).toBe(1000);
      expect(stack.config.retryDelay).toBe(1000);
    });

    it('should accept both retryLimit and retryDelay configuration', () => {
      const config: StackConfig = {
        apiKey: 'test-api-key',
        deliveryToken: 'test-delivery-token',
        environment: 'test-environment',
        retryLimit: 2,
        retryDelay: 500
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      expect(client.defaults.retryLimit).toBe(2);
      expect(client.defaults.retryDelay).toBe(500);
      expect(stack.config.retryLimit).toBe(2);
      expect(stack.config.retryDelay).toBe(500);
    });

    it('should accept retryOnError configuration', () => {
      const config: StackConfig = {
        apiKey: 'test-api-key',
        deliveryToken: 'test-delivery-token',
        environment: 'test-environment',
        retryOnError: false
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      expect(client.defaults.retryOnError).toBe(false);
      expect(stack.config.retryOnError).toBe(false);
    });

    it('should accept custom retryCondition function', () => {
      const customRetryCondition = (error: any) => error.response?.status === 500;
      
      const config: StackConfig = {
        apiKey: 'test-api-key',
        deliveryToken: 'test-delivery-token',
        environment: 'test-environment',
        retryCondition: customRetryCondition
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      expect(client.defaults.retryCondition).toBe(customRetryCondition);
      expect(stack.config.retryCondition).toBe(customRetryCondition);
    });
  });

  describe('Retry Configuration Integration', () => {
    it('should pass retry configuration to the http client', () => {
      const config: StackConfig = {
        apiKey: 'test-api-key',
        deliveryToken: 'test-delivery-token',
        environment: 'test-environment',
        retryLimit: 4,
        retryDelay: 750,
        retryOnError: true
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      // Verify configuration is passed to the underlying HTTP client
      expect(client.defaults.retryLimit).toBe(4);
      expect(client.defaults.retryDelay).toBe(750);
      expect(client.defaults.retryOnError).toBe(true);
    });

    it('should maintain retry configuration in stackConfig property', () => {
      const config: StackConfig = {
        apiKey: 'test-api-key',
        deliveryToken: 'test-delivery-token',
        environment: 'test-environment',
        retryLimit: 6,
        retryDelay: 200
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      // The client should have a stackConfig property with retry settings
      expect(client.stackConfig).toBeDefined();
      expect(client.stackConfig.retryLimit).toBe(6);
      expect(client.stackConfig.retryDelay).toBe(200);
    });
  });

  describe('Retry Configuration Verification', () => {
    it('should verify retry interceptors are configured when retryLimit is set', () => {
      const config: StackConfig = {
        apiKey: 'test-api-key',
        deliveryToken: 'test-delivery-token',
        environment: 'test-environment',
        retryLimit: 2,
        retryDelay: 100
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      // Verify retry interceptors are present
      expect(client.interceptors.request.handlers.length).toBeGreaterThan(0);
      expect(client.interceptors.response.handlers.length).toBeGreaterThan(0);
      
      // Verify configuration is properly set
      expect(client.defaults.retryLimit).toBe(2);
      expect(client.defaults.retryDelay).toBe(100);
    });

    it('should verify retry configuration is accessible through stackConfig', () => {
      const config: StackConfig = {
        apiKey: 'test-api-key',
        deliveryToken: 'test-delivery-token',
        environment: 'test-environment',
        retryLimit: 3,
        retryDelay: 200
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      // Verify stackConfig contains retry settings
      expect(client.stackConfig).toBeDefined();
      expect(client.stackConfig.retryLimit).toBe(3);
      expect(client.stackConfig.retryDelay).toBe(200);
    });

    it('should verify retry settings are passed to httpClient configuration', () => {
      const config: StackConfig = {
        apiKey: 'test-api-key',
        deliveryToken: 'test-delivery-token',
        environment: 'test-environment',
        retryLimit: 4,
        retryDelay: 500,
        retryOnError: false
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      // Check that all retry settings are correctly configured
      expect(client.defaults.retryLimit).toBe(4);
      expect(client.defaults.retryDelay).toBe(500);
      expect(client.defaults.retryOnError).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero retryLimit', () => {
      const config: StackConfig = {
        apiKey: 'test-api-key',
        deliveryToken: 'test-delivery-token',
        environment: 'test-environment',
        retryLimit: 0
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      expect(client.defaults.retryLimit).toBe(0);
    });

    it('should handle zero retryDelay', () => {
      const config: StackConfig = {
        apiKey: 'test-api-key',
        deliveryToken: 'test-delivery-token',
        environment: 'test-environment',
        retryDelay: 0
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      expect(client.defaults.retryDelay).toBe(0);
    });

    it('should handle large retry values', () => {
      const config: StackConfig = {
        apiKey: 'test-api-key',
        deliveryToken: 'test-delivery-token',
        environment: 'test-environment',
        retryLimit: 100,
        retryDelay: 5000
      };

      const stack = Contentstack.stack(config);
      const client = stack.getClient();

      expect(client.defaults.retryLimit).toBe(100);
      expect(client.defaults.retryDelay).toBe(5000);
    });
  });
});
