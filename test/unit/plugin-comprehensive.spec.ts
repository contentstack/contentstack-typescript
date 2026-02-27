/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Comprehensive tests for ContentstackPlugin interface, export functionality,
 * and basic plugin implementation patterns
 */
import * as Contentstack from "../../src/stack";
import { ContentstackPlugin, StackConfig } from "../../src/common/types";
import { ContentstackPlugin as ExportedPlugin } from "../../src/index";

// Mock the core module
jest.mock("@contentstack/core", () => ({
  httpClient: jest.fn(() => ({
    defaults: { host: "cdn.contentstack.io" },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
  retryRequestHandler: jest.fn((req) => req),
  retryResponseHandler: jest.fn((res) => res),
  retryResponseErrorHandler: jest.fn((error) => Promise.reject(error)),
}));

describe("Plugin Comprehensive Tests", () => {
  describe("ContentstackPlugin Interface", () => {
    describe("Interface Implementation", () => {
      it("should allow implementing the ContentstackPlugin interface with a class", () => {
        class LoggingPlugin implements ContentstackPlugin {
          private requestCount = 0;
          private responseCount = 0;

          onRequest(config: any): any {
            this.requestCount++;
            console.log(`Request #${this.requestCount}:`, config.url);
            return {
              ...config,
              headers: {
                ...config.headers,
                'X-Request-Count': this.requestCount.toString(),
              },
            };
          }

          onResponse(request: any, response: any, data: any): any {
            this.responseCount++;
            console.log(`Response #${this.responseCount}:`, response.status);
            return {
              ...response,
              data: {
                ...data,
                _plugin_metadata: {
                  requestCount: this.requestCount,
                  responseCount: this.responseCount,
                },
              },
            };
          }

          getStats() {
            return {
              requests: this.requestCount,
              responses: this.responseCount,
            };
          }
        }

        const plugin = new LoggingPlugin();
        expect(plugin).toBeInstanceOf(LoggingPlugin);
        expect(typeof plugin.onRequest).toBe('function');
        expect(typeof plugin.onResponse).toBe('function');
        expect(plugin.getStats().requests).toBe(0);
      });

      it("should allow implementing the ContentstackPlugin interface with an object", () => {
        const authPlugin: ContentstackPlugin = {
          onRequest(config: any): any {
            return {
              ...config,
              headers: {
                ...config.headers,
                'Authorization': 'Bearer token123',
                'X-Custom-Auth': 'plugin-auth',
              },
            };
          },

          onResponse(request: any, response: any, data: any): any {
            // Remove sensitive data from response
            const sanitizedData = { ...data };
            delete sanitizedData.sensitive_field;
            
            return {
              ...response,
              data: sanitizedData,
            };
          },
        };

        expect(typeof authPlugin.onRequest).toBe('function');
        expect(typeof authPlugin.onResponse).toBe('function');
      });

      it("should allow creating performance monitoring plugins", () => {
        class PerformancePlugin implements ContentstackPlugin {
          private requestTimes = new Map<string, number>();
          private metrics = {
            totalRequests: 0,
            totalResponseTime: 0,
            errors: 0,
          };

          onRequest(config: any): any {
            const requestId = `${config.method}_${config.url}_${Date.now()}`;
            this.requestTimes.set(requestId, Date.now());
            this.metrics.totalRequests++;

            return {
              ...config,
              requestId,
              startTime: Date.now(),
            };
          }

          onResponse(request: any, response: any, data: any): any {
            const requestId = request.requestId;
            const startTime = this.requestTimes.get(requestId);
            
            if (startTime) {
              const responseTime = Date.now() - startTime;
              this.metrics.totalResponseTime += responseTime;
              this.requestTimes.delete(requestId);
            }

            if (response.status >= 400) {
              this.metrics.errors++;
            }

            return {
              ...response,
              data: {
                ...data,
                _analytics: {
                  responseTime: startTime ? Date.now() - startTime : 0,
                  status: response.status,
                },
              },
            };
          }

          getMetrics() {
            return {
              ...this.metrics,
              averageResponseTime: this.metrics.totalRequests > 0 
                ? this.metrics.totalResponseTime / this.metrics.totalRequests 
                : 0,
            };
          }
        }

        const plugin = new PerformancePlugin();
        expect(plugin.getMetrics().totalRequests).toBe(0);
        expect(plugin.getMetrics().averageResponseTime).toBe(0);
      });
    });

    describe("Plugin Integration with Stack", () => {
      it("should accept typed plugins in stack configuration", () => {
        const mockPlugin: ContentstackPlugin = {
          onRequest: jest.fn((config) => config),
          onResponse: jest.fn((request, response, data) => response),
        };

        const config: StackConfig = {
          apiKey: "test-api-key",
          deliveryToken: "test-delivery-token",
          environment: "test-env",
          plugins: [mockPlugin], // This should be type-safe now
        };

        expect(() => Contentstack.stack(config)).not.toThrow();
        expect(mockPlugin.onRequest).toHaveBeenCalledTimes(0); // Not called during setup
        expect(mockPlugin.onResponse).toHaveBeenCalledTimes(0);
      });

      it("should handle multiple typed plugins", () => {
        const requestLogger: ContentstackPlugin = {
          onRequest(config: any): any {
            console.log('Request logged:', config.url);
            return config;
          },
          onResponse(request: any, response: any, data: any): any {
            return response;
          },
        };

        const responseTransformer: ContentstackPlugin = {
          onRequest(config: any): any {
            return config;
          },
          onResponse(request: any, response: any, data: any): any {
            return {
              ...response,
              data: {
                ...data,
                transformed: true,
                timestamp: new Date().toISOString(),
              },
            };
          },
        };

        const config: StackConfig = {
          apiKey: "test-api-key",
          deliveryToken: "test-delivery-token",
          environment: "test-env",
          plugins: [requestLogger, responseTransformer],
        };

        expect(() => Contentstack.stack(config)).not.toThrow();
      });

      it("should provide type safety for plugin method signatures", () => {
        // This test verifies that the interface enforces correct method signatures
        class TypeSafePlugin implements ContentstackPlugin {
          onRequest(config: any): any {
            // TypeScript should enforce that config is an object
            expect(typeof config).toBe('object');
            return config;
          }

          onResponse(request: any, response: any, data: any): any {
            // TypeScript should enforce correct parameter types
            expect(typeof request).toBe('object');
            expect(typeof response).toBe('object');
            return response;
          }
        }

        const plugin = new TypeSafePlugin();
        const mockConfig = { url: '/test', method: 'GET' };
        const mockResponse = { status: 200, data: {} };

        expect(() => plugin.onRequest(mockConfig)).not.toThrow();
        expect(() => plugin.onResponse(mockConfig, mockResponse, {})).not.toThrow();
      });
    });

    describe("Plugin Examples", () => {
      it("should demonstrate common plugin patterns", () => {
        // Example 1: Simple request/response logger
        const simpleLogger: ContentstackPlugin = {
          onRequest(config) {
            console.log(`→ ${config.method?.toUpperCase()} ${config.url}`);
            return config;
          },
          onResponse(request, response, data) {
            console.log(`← ${response.status} ${request.url}`);
            return response;
          },
        };

        // Example 2: Error handling plugin
        const errorHandler: ContentstackPlugin = {
          onRequest(config) {
            return { ...config, retryAttempts: 0 };
          },
          onResponse(request, response, data) {
            if (response.status >= 400) {
              console.error(`Error ${response.status}: ${request.url}`);
            }
            return response;
          },
        };

        expect(typeof simpleLogger.onRequest).toBe('function');
        expect(typeof simpleLogger.onResponse).toBe('function');
        expect(typeof errorHandler.onRequest).toBe('function');
        expect(typeof errorHandler.onResponse).toBe('function');
      });

      it("should support advanced plugin patterns", () => {
        // Caching plugin example
        class CachePlugin implements ContentstackPlugin {
          private cache = new Map<string, any>();

          onRequest(config: any): any {
            const cacheKey = `${config.method}_${config.url}`;
            const cached = this.cache.get(cacheKey);
            
            if (cached) {
              console.log('Cache hit for:', cacheKey);
            }
            
            return { ...config, cacheKey };
          }

          onResponse(request: any, response: any, data: any): any {
            if (response.status === 200 && request.cacheKey) {
              this.cache.set(request.cacheKey, data);
            }
            return response;
          }

          clearCache() {
            this.cache.clear();
          }
        }

        const cachePlugin = new CachePlugin();
        expect(cachePlugin).toBeInstanceOf(CachePlugin);
        expect(typeof cachePlugin.clearCache).toBe('function');
      });
    });
  });

  describe("ContentstackPlugin Export", () => {
    it("should export ContentstackPlugin interface from main package", () => {
      // We can use it for type annotations
      const plugin: ExportedPlugin = {
        onRequest(config: any): any {
          return config;
        },
        onResponse(request: any, response: any, data: any): any {
          return response;
        }
      };

      expect(typeof plugin.onRequest).toBe('function');
      expect(typeof plugin.onResponse).toBe('function');
    });

    it("should provide TypeScript intellisense and type checking", () => {
      // This test verifies that the interface provides proper TypeScript support
      class ExamplePlugin implements ExportedPlugin {
        onRequest(config: any): any {
          // TypeScript should provide intellisense for config properties
          return {
            ...config,
            headers: {
              ...config.headers,
              'X-Plugin': 'example'
            }
          };
        }

        onResponse(request: any, response: any, data: any): any {
          // TypeScript should provide intellisense for response properties
          return {
            ...response,
            data: {
              ...data,
              processed: true
            }
          };
        }
      }

      const plugin = new ExamplePlugin();
      expect(plugin).toBeInstanceOf(ExamplePlugin);
    });

    it("should allow plugin implementations to be used with stack configuration", () => {
      class FullExamplePlugin implements ExportedPlugin {
        private pluginName = 'FullExamplePlugin';

        onRequest(config: any): any {
          return {
            ...config,
            headers: {
              ...config.headers,
              'X-Plugin-Name': this.pluginName,
              'X-Plugin-Version': '1.0.0'
            }
          };
        }

        onResponse(request: any, response: any, data: any): any {
          return {
            ...response,
            data: {
              ...data,
              _plugin: {
                name: this.pluginName,
                processedAt: new Date().toISOString()
              }
            }
          };
        }

        getName() {
          return this.pluginName;
        }
      }

      const plugin = new FullExamplePlugin();
      
      // Should work in stack configuration
      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [plugin]
      };

      expect(() => Contentstack.stack(config)).not.toThrow();
      expect(plugin.getName()).toBe('FullExamplePlugin');
    });
  });

  describe("Plugin Configuration Patterns", () => {
    it("should support configurable plugins", () => {
      interface PluginConfig {
        enabled: boolean;
        logLevel: 'debug' | 'info' | 'warn' | 'error';
        prefix?: string;
      }

      class ConfigurablePlugin implements ContentstackPlugin {
        constructor(private config: PluginConfig) {}

        onRequest(config: any): any {
          if (!this.config.enabled) {
            return config;
          }

          const prefix = this.config.prefix || '[Plugin]';
          if (this.config.logLevel === 'debug') {
            console.log(`${prefix} Request:`, config.url);
          }

          return {
            ...config,
            pluginConfig: this.config
          };
        }

        onResponse(request: any, response: any, data: any): any {
          if (!this.config.enabled) {
            return response;
          }

          const prefix = this.config.prefix || '[Plugin]';
          if (this.config.logLevel === 'debug') {
            console.log(`${prefix} Response:`, response.status);
          }

          return response;
        }
      }

      const plugin = new ConfigurablePlugin({
        enabled: true,
        logLevel: 'debug',
        prefix: '[MyApp]'
      });

      expect(plugin).toBeInstanceOf(ConfigurablePlugin);
    });

    it("should support plugin composition", () => {
      // Base plugin interface
      abstract class BasePlugin implements ContentstackPlugin {
        abstract onRequest(config: any): any;
        abstract onResponse(request: any, response: any, data: any): any;

        protected log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
          console.log(`[${level.toUpperCase()}] ${message}`);
        }
      }

      // Specific plugin implementations
      class AuthPlugin extends BasePlugin {
        constructor(private token: string) {
          super();
        }

        onRequest(config: any): any {
          this.log('Adding authentication');
          return {
            ...config,
            headers: {
              ...config.headers,
              'Authorization': `Bearer ${this.token}`
            }
          };
        }

        onResponse(request: any, response: any, data: any): any {
          if (response.status === 401) {
            this.log('Authentication failed', 'error');
          }
          return response;
        }
      }

      class MetricsPlugin extends BasePlugin {
        private metrics = { requests: 0, responses: 0 };

        onRequest(config: any): any {
          this.metrics.requests++;
          this.log(`Request count: ${this.metrics.requests}`);
          return config;
        }

        onResponse(request: any, response: any, data: any): any {
          this.metrics.responses++;
          this.log(`Response count: ${this.metrics.responses}`);
          return response;
        }

        getMetrics() {
          return { ...this.metrics };
        }
      }

      const authPlugin = new AuthPlugin('test-token');
      const metricsPlugin = new MetricsPlugin();

      expect(authPlugin).toBeInstanceOf(BasePlugin);
      expect(metricsPlugin).toBeInstanceOf(BasePlugin);
      expect(metricsPlugin.getMetrics().requests).toBe(0);
    });
  });

  describe("Plugin Error Handling", () => {
    it("should handle plugins that throw errors gracefully", () => {
      const errorPlugin: ContentstackPlugin = {
        onRequest(config: any): any {
          throw new Error("Plugin request error");
        },
        onResponse(request: any, response: any, data: any): any {
          throw new Error("Plugin response error");
        },
      };

      const config: StackConfig = {
        apiKey: "test-api-key",
        deliveryToken: "test-delivery-token",
        environment: "test-env",
        plugins: [errorPlugin],
      };

      // Stack creation should not throw even if plugins have errors
      expect(() => Contentstack.stack(config)).not.toThrow();
    });

    it("should handle plugins with missing or invalid methods", () => {
      // Plugin with missing onResponse method
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

    it("should handle plugins with different return types", () => {
      class FlexiblePlugin implements ContentstackPlugin {
        onRequest(config: any): any {
          // Sometimes return a promise
          if (config.async) {
            return Promise.resolve({ ...config, asyncProcessed: true });
          }
          // Sometimes return synchronously
          return { ...config, syncProcessed: true };
        }

        onResponse(request: any, response: any, data: any): any {
          // Can return modified response or original
          if (request.transform) {
            return {
              ...response,
              data: { ...data, transformed: true }
            };
          }
          return response;
        }
      }

      const plugin = new FlexiblePlugin();
      expect(plugin).toBeInstanceOf(FlexiblePlugin);
    });
  });
});
