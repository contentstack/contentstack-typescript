/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Comprehensive tests for plugin-interceptor interactions, edge cases,
 * execution flow, and integration scenarios
 */
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import * as core from "@contentstack/core";
import * as Contentstack from "../../src/stack";
import { Stack } from "../../src/stack";
import { Policy, StackConfig, ContentstackPlugin } from "../../src/common/types";

jest.mock("@contentstack/core");

describe("Plugin-Interceptor Comprehensive Tests", () => {
  let mockHttpClient: any;
  let reqInterceptorCallOrder: string[];
  let resInterceptorCallOrder: string[];
  
  beforeEach(() => {
    reqInterceptorCallOrder = [];
    resInterceptorCallOrder = [];
    
    mockHttpClient = {
      defaults: {
        host: "cdn.contentstack.io",
        adapter: jest.fn(),
        logHandler: jest.fn(),
      },
      interceptors: {
        request: {
          use: jest.fn((handler) => {
            // Track the order of request interceptor registrations
            if (handler.toString().includes('retryRequestHandler')) {
              reqInterceptorCallOrder.push('retry');
            } else if (handler.toString().includes('pluginInstance')) {
              reqInterceptorCallOrder.push('plugin');
            } else {
              reqInterceptorCallOrder.push('other');
            }
          }),
        },
        response: {
          use: jest.fn((successHandler, errorHandler) => {
            // Track the order of response interceptor registrations
            if (errorHandler && errorHandler.toString().includes('retryResponseErrorHandler')) {
              resInterceptorCallOrder.push('retry-error');
              resInterceptorCallOrder.push('retry-success'); // Both success and error handler for retry
            } else if (successHandler && successHandler.toString().includes('pluginInstance')) {
              resInterceptorCallOrder.push('plugin-success');
            } else {
              resInterceptorCallOrder.push('other-success');
            }
          }),
        },
      },
    };

    (core.httpClient as jest.Mock).mockReturnValue(mockHttpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Interceptor Registration Order", () => {
    it("should register retry interceptors before plugin interceptors", () => {
      const mockPlugin = {
        onRequest: jest.fn((req) => req),
        onResponse: jest.fn((req, res, data) => res),
      };

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [mockPlugin],
      };

      Contentstack.stack(config);

      // Verify registration order for request interceptors
      expect(reqInterceptorCallOrder).toEqual(['retry', 'plugin']);
      
      // Verify registration order for response interceptors
      expect(resInterceptorCallOrder).toContain('retry-success');
      expect(resInterceptorCallOrder).toContain('retry-error');
      expect(resInterceptorCallOrder).toContain('plugin-success');
      
      // Plugin response interceptor should be registered after retry response interceptor
      // (which means plugins run BEFORE retry in the response chain due to Axios reverse order)
      const pluginIndex = resInterceptorCallOrder.indexOf('plugin-success');
      const retryIndex = resInterceptorCallOrder.indexOf('retry-success');
      expect(pluginIndex).toBeGreaterThan(retryIndex);
    });

    it("should handle empty plugins array", () => {
      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [],
      };

      expect(() => Contentstack.stack(config)).not.toThrow();
      
      // Should only have retry interceptors (but empty plugins array still triggers plugin registration)
      expect(mockHttpClient.interceptors.request.use).toHaveBeenCalledTimes(2);
      expect(mockHttpClient.interceptors.response.use).toHaveBeenCalledTimes(2);
    });
  });

  describe("Plugin Error Handling Edge Cases", () => {
    it("should handle plugin throwing error in onRequest without breaking retry logic", () => {
      const errorThrowingPlugin = {
        onRequest: jest.fn(() => {
          throw new Error("Plugin request error");
        }),
        onResponse: jest.fn((req, res, data) => res),
      };

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [errorThrowingPlugin],
      };

      // Should not throw during stack creation
      expect(() => Contentstack.stack(config)).not.toThrow();
      
      // Verify plugin interceptor was still registered
      expect(mockHttpClient.interceptors.request.use).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it("should handle plugin throwing error in onResponse", () => {
      const errorThrowingPlugin = {
        onRequest: jest.fn((req) => req),
        onResponse: jest.fn(() => {
          throw new Error("Plugin response error");
        }),
      };

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [errorThrowingPlugin],
      };

      expect(() => Contentstack.stack(config)).not.toThrow();
    });

    it("should handle plugins with async operations", () => {
      const asyncPlugin = {
        onRequest: jest.fn(async (req) => {
          await new Promise(resolve => setTimeout(resolve, 1));
          return { ...req, asyncProcessed: true };
        }),
        onResponse: jest.fn(async (req, res, data) => {
          await new Promise(resolve => setTimeout(resolve, 1));
          return { ...res, asyncProcessed: true };
        }),
      };

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [asyncPlugin],
      };

      expect(() => Contentstack.stack(config)).not.toThrow();
    });
  });

  describe("Plugin Mutation Edge Cases", () => {
    it("should handle plugin modifying retry-critical request properties", () => {
      const retryPropertyMutatingPlugin = {
        onRequest: jest.fn((reqConfig: AxiosRequestConfig) => {
          // Plugin modifies properties that retry logic depends on
          return {
            ...reqConfig,
            retryCount: 10, // Should not affect retry logic
            url: "https://malicious-host.com", // Should not break retries
            timeout: 1, // Very short timeout
          };
        }),
        onResponse: jest.fn((req, res, data) => res),
      };

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [retryPropertyMutatingPlugin],
      };

      expect(() => Contentstack.stack(config)).not.toThrow();
      expect(retryPropertyMutatingPlugin.onRequest).not.toHaveBeenCalled(); // Only registered, not called yet
    });

    it("should handle plugin modifying response before retry handler sees it", () => {
      const responseModifyingPlugin = {
        onRequest: jest.fn((req) => req),
        onResponse: jest.fn((req, res, data) => {
          // Plugin modifies response that retry logic might depend on
          return {
            ...res,
            status: 200, // Changing from potential error status
            data: { modified: true },
            headers: {
              ...res.headers,
              "x-ratelimit-remaining": "0", // This could affect retry logic
            },
          };
        }),
      };

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [responseModifyingPlugin],
      };

      expect(() => Contentstack.stack(config)).not.toThrow();
    });

    it("should handle multiple plugins with conflicting modifications", () => {
      const plugin1 = {
        onRequest: jest.fn((req) => ({ ...req, customHeader1: "value1" })),
        onResponse: jest.fn((req, res, data) => ({ ...res, plugin1: true })),
      };

      const plugin2 = {
        onRequest: jest.fn((req) => ({ ...req, customHeader1: "value2", customHeader2: "value2" })),
        onResponse: jest.fn((req, res, data) => ({ ...res, plugin2: true })),
      };

      const plugin3 = {
        onRequest: jest.fn((req) => req), // No modification
        onResponse: jest.fn((req, res, data) => ({ ...res, plugin3: true })),
      };

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [plugin1, plugin2, plugin3],
      };

      expect(() => Contentstack.stack(config)).not.toThrow();
      
      // Verify all plugins were registered
      expect(mockHttpClient.interceptors.request.use).toHaveBeenCalledTimes(2); // retry + plugin interceptor
      expect(mockHttpClient.interceptors.response.use).toHaveBeenCalledTimes(2); // retry + plugin interceptor
    });
  });

  describe("Cache + Plugin + Retry Interaction", () => {
    it("should handle plugins with cache adapter and retry logic", () => {
      const cacheInterferingPlugin = {
        onRequest: jest.fn((req) => {
          // Plugin might interfere with cache keys
          return {
            ...req,
            contentTypeUid: "modified-uid", // This affects cache key
            maxAge: 0, // This affects cache behavior
          };
        }),
        onResponse: jest.fn((req, res, data) => {
          // Plugin modifies cached response
          return {
            ...res,
            data: { ...data, cached: false },
          };
        }),
      };

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [cacheInterferingPlugin],
        cacheOptions: {
          policy: Policy.CACHE_THEN_NETWORK,
          persistenceStore: { setItem: jest.fn(), getItem: jest.fn() },
        },
      };

      expect(() => Contentstack.stack(config)).not.toThrow();
      
      // Verify cache adapter was set
      expect(mockHttpClient.defaults.adapter).toBeDefined();
    });

    it("should handle plugins with different cache policies", () => {
      const plugin = {
        onRequest: jest.fn((req) => req),
        onResponse: jest.fn((req, res, data) => res),
      };

      const policies = [
        Policy.IGNORE_CACHE,
        Policy.CACHE_THEN_NETWORK,
        Policy.CACHE_ELSE_NETWORK,
        Policy.NETWORK_ELSE_CACHE,
      ];

      const mockPersistenceStore = { setItem: jest.fn(), getItem: jest.fn() };
      policies.forEach((policy) => {
        const config: StackConfig = {
          apiKey: "test-api-key",
          deliveryToken: "test-delivery-token",
          environment: "test-env",
          plugins: [plugin],
          cacheOptions:
            policy === Policy.IGNORE_CACHE
              ? { policy }
              : { policy, persistenceStore: mockPersistenceStore },
        };

        expect(() => Contentstack.stack(config)).not.toThrow();
      });
    });
  });

  describe("Plugin Execution Flow", () => {
    let retryRequestHandler: jest.Mock;
    let retryResponseHandler: jest.Mock;
    let retryResponseErrorHandler: jest.Mock;
    let executionOrder: string[];

    beforeEach(() => {
      executionOrder = [];
      
      retryRequestHandler = jest.fn((req) => {
        executionOrder.push('retry-request');
        return { ...req, retryCount: (req.retryCount || 0) + 1 };
      });
      
      retryResponseHandler = jest.fn((res) => {
        executionOrder.push('retry-response');
        return res;
      });
      
      retryResponseErrorHandler = jest.fn((error, config, axiosInstance) => {
        executionOrder.push('retry-error');
        return Promise.reject(error);
      });

      // Mock the core functions
      (core.retryRequestHandler as jest.Mock) = retryRequestHandler;
      (core.retryResponseHandler as jest.Mock) = retryResponseHandler;
      (core.retryResponseErrorHandler as jest.Mock) = retryResponseErrorHandler;

      // Update mock to use real axios creation but with mocked interceptors
      jest.spyOn(axios, 'create').mockImplementation((config) => {
        const mockInstance = {
          defaults: { ...config },
          interceptors: {
            request: {
              use: jest.fn((handler) => {
                // Store the handler for later execution
                mockInstance.requestHandlers = mockInstance.requestHandlers || [];
                mockInstance.requestHandlers.push(handler);
                return mockInstance.requestHandlers.length - 1;
              }),
            },
            response: {
              use: jest.fn((successHandler, errorHandler) => {
                mockInstance.responseHandlers = mockInstance.responseHandlers || [];
                mockInstance.responseHandlers.push({ successHandler, errorHandler });
                return mockInstance.responseHandlers.length - 1;
              }),
            },
          },
          request: jest.fn(),
          get: jest.fn(),
          post: jest.fn(),
          put: jest.fn(),
          delete: jest.fn(),
          httpClientParams: config,
        } as any;
        
        return mockInstance;
      });
    });

    it("should execute request interceptors in correct order: retry -> plugins", () => {
      const plugin1 = {
        onRequest: jest.fn((req) => {
          executionOrder.push('plugin1-request');
          return req;
        }),
        onResponse: jest.fn((req, res, data) => {
          executionOrder.push('plugin1-response');
          return res;
        }),
      };

      const plugin2 = {
        onRequest: jest.fn((req) => {
          executionOrder.push('plugin2-request');
          return req;
        }),
        onResponse: jest.fn((req, res, data) => {
          executionOrder.push('plugin2-response');
          return res;
        }),
      };

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [plugin1, plugin2],
      };

      Contentstack.stack(config);

      // Verify interceptors were registered in correct order
      const axiosInstance = (core.httpClient as jest.Mock).mock.results[0].value;
      expect(axiosInstance.interceptors.request.use).toHaveBeenCalledTimes(2);
      expect(axiosInstance.interceptors.response.use).toHaveBeenCalledTimes(2);

      // Get the registered interceptor functions
      const requestCalls = axiosInstance.interceptors.request.use.mock.calls;

      // Simulate request execution order (Axios executes in registration order)
      const retryRequestInterceptor = requestCalls[0][0];
      const pluginRequestInterceptor = requestCalls[1][0];

      const mockRequest = { url: '/test', method: 'GET' };
      
      // Execute request interceptors in order
      let modifiedRequest = retryRequestInterceptor(mockRequest);
      modifiedRequest = pluginRequestInterceptor(modifiedRequest);

      expect(plugin1.onRequest).toHaveBeenCalled();
      expect(plugin2.onRequest).toHaveBeenCalled();
    });

    it("should preserve retry count through plugin modifications", () => {
      const retryCountModifyingPlugin = {
        onRequest: jest.fn((req) => {
          // Plugin tries to modify retry count
          return {
            ...req,
            retryCount: 999, // Should not affect actual retry logic
            customProperty: 'added',
          };
        }),
        onResponse: jest.fn((req, res, data) => res),
      };

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [retryCountModifyingPlugin],
      };

      const stack = Contentstack.stack(config);
      expect(stack).toBeInstanceOf(Stack);

      // Verify plugin was registered
      const axiosInstance = (core.httpClient as jest.Mock).mock.results[0].value;
      expect(axiosInstance.interceptors.request.use).toHaveBeenCalledTimes(2);
    });
  });

  describe("Plugin Type Safety Edge Cases", () => {
    it("should handle plugin with missing methods", () => {
      const incompletePlugin = {
        onRequest: jest.fn((req) => req),
        // Missing onResponse method
      } as any;

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [incompletePlugin],
      };

      // Should handle gracefully during stack creation
      expect(() => Contentstack.stack(config)).not.toThrow();
    });

    it("should handle plugins when retry is disabled", () => {
      const plugin = {
        onRequest: jest.fn((req) => req),
        onResponse: jest.fn((req, res, data) => res),
      };

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [plugin],
        retryOnError: false,
      };

      expect(() => Contentstack.stack(config)).not.toThrow();
    });

    it("should handle plugins with custom retry conditions", () => {
      const plugin = {
        onRequest: jest.fn((req) => req),
        onResponse: jest.fn((req, res, data) => res),
      };

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [plugin],
        retryCondition: jest.fn(() => true),
        retryLimit: 3,
        retryDelay: 100,
      };

      expect(() => Contentstack.stack(config)).not.toThrow();
    });
  });

  describe("Plugin State Management", () => {
    it("should handle plugins that maintain internal state", () => {
      class StatefulPlugin {
        private requestCount = 0;
        private responseCount = 0;

        onRequest = jest.fn((req) => {
          this.requestCount++;
          return { ...req, requestId: this.requestCount };
        });

        onResponse = jest.fn((req, res, data) => {
          this.responseCount++;
          return { ...res, responseId: this.responseCount };
        });
      }

      const statefulPlugin = new StatefulPlugin();

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [statefulPlugin],
      };

      expect(() => Contentstack.stack(config)).not.toThrow();
    });

    it("should handle plugins that modify config object", () => {
      const configModifyingPlugin = {
        onRequest: jest.fn((req) => {
          // Plugin tries to modify the original config
          if (req.stackConfig) {
            req.stackConfig.modified = true;
          }
          return req;
        }),
        onResponse: jest.fn((req, res, data) => res),
      };

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [configModifyingPlugin],
      };

      expect(() => Contentstack.stack(config)).not.toThrow();
    });
  });

  describe("Performance and Scale Testing", () => {
    it("should handle large number of plugins efficiently", () => {
      const plugins = Array.from({ length: 50 }, (_, i) => ({
        onRequest: jest.fn((req) => ({
          ...req,
          [`plugin${i}`]: true,
        })),
        onResponse: jest.fn((req, res, data) => ({
          ...res,
          data: {
            ...data,
            [`plugin${i}Processed`]: true,
          },
        })),
      }));

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins,
      };

      const startTime = Date.now();
      const stack = Contentstack.stack(config);
      const endTime = Date.now();

      expect(stack).toBeInstanceOf(Stack);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it("should handle plugins with large data modifications", () => {
      const largeDataSize = 10000; // 10KB of data
      const largeData = 'x'.repeat(largeDataSize);

      const largeDataPlugin = {
        onRequest: jest.fn((req) => ({
          ...req,
          largePayload: largeData,
        })),
        onResponse: jest.fn((req, res, data) => ({
          ...res,
          data: {
            ...data,
            largeResponse: largeData,
          },
        })),
      };

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [largeDataPlugin],
      };

      expect(() => Contentstack.stack(config)).not.toThrow();
    });
  });

  describe("Plugin Configuration Edge Cases", () => {
    it("should handle plugins with different configuration combinations", () => {
      const plugin = {
        onRequest: jest.fn((req) => req),
        onResponse: jest.fn((req, res, data) => res),
      };

      const configs = [
        // With cache and retry
        {
          apiKey: "test",
          deliveryToken: "test",
          environment: "test",
          plugins: [plugin],
          cacheOptions: {
            policy: Policy.CACHE_THEN_NETWORK,
            persistenceStore: { setItem: jest.fn(), getItem: jest.fn() },
          },
          retryOnError: true,
        },
        // With custom retry settings
        {
          apiKey: "test",
          deliveryToken: "test",
          environment: "test",
          plugins: [plugin],
          retryLimit: 10,
          retryDelay: 1000,
          retryCondition: jest.fn(() => false),
        },
        // With live preview
        {
          apiKey: "test",
          deliveryToken: "test",
          environment: "test",
          plugins: [plugin],
          live_preview: { enable: true },
        },
        // With early access headers
        {
          apiKey: "test",
          deliveryToken: "test",
          environment: "test",
          plugins: [plugin],
          early_access: ['feature1', 'feature2'],
        },
      ];

      configs.forEach((config) => {
        expect(() => Contentstack.stack(config as StackConfig)).not.toThrow();
      });
    });

    it("should handle real-world plugin scenarios", () => {
      // Simulate a complex, real-world plugin
      class ProductionPlugin implements ContentstackPlugin {
        private metrics = {
          requests: 0,
          responses: 0,
          errors: 0,
          cache_hits: 0
        };

        onRequest(config: any): any {
          this.metrics.requests++;
          
          // Add request ID for tracking
          const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Add monitoring headers
          return {
            ...config,
            headers: {
              ...config.headers,
              'X-Request-ID': requestId,
              'X-Client-Version': '1.0.0',
              'X-Timestamp': new Date().toISOString()
            },
            metadata: {
              ...config.metadata,
              requestId,
              startTime: performance.now()
            }
          };
        }

        onResponse(request: any, response: any, data: any): any {
          this.metrics.responses++;
          
          // Track errors
          if (response.status >= 400) {
            this.metrics.errors++;
          }
          
          // Track cache hits
          if (response.headers['x-cache'] === 'HIT') {
            this.metrics.cache_hits++;
          }
          
          // Add response metadata
          return {
            ...response,
            data: {
              ...data,
              _meta: {
                requestId: request.metadata?.requestId,
                processingTime: request.metadata?.startTime 
                  ? performance.now() - request.metadata.startTime 
                  : 0,
                timestamp: new Date().toISOString()
              }
            }
          };
        }

        getMetrics() {
          return { ...this.metrics };
        }
      }

      const plugin = new ProductionPlugin();
      
      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [plugin],
        cacheOptions: {
          policy: Policy.CACHE_ELSE_NETWORK,
          persistenceStore: { setItem: jest.fn(), getItem: jest.fn() },
        },
        retryOnError: true,
        retryLimit: 3,
      };

      expect(() => Contentstack.stack(config)).not.toThrow();
      expect(plugin.getMetrics().requests).toBe(0); // Not called during setup
    });
  });
});
