/**
 * Example implementations of ContentstackPlugin interface
 * This file demonstrates various ways to create and use plugins
 */
import contentstack, { ContentstackPlugin } from '@contentstack/delivery-sdk';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

// Example 1: Simple logging plugin as a class
class LoggingPlugin implements ContentstackPlugin {
  private requestCount = 0;

  onRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    this.requestCount++;
    console.log(`[Plugin] Request #${this.requestCount}: ${config.method?.toUpperCase()} ${config.url}`);
    
    return {
      ...config,
      headers: {
        ...config.headers,
        'X-Request-ID': `req-${this.requestCount}-${Date.now()}`
      }
    };
  }

  onResponse(request: AxiosRequestConfig, response: AxiosResponse, data: any): AxiosResponse {
    console.log(`[Plugin] Response: ${response.status} for ${request.url}`);
    
    return {
      ...response,
      data: {
        ...data,
        _meta: {
          requestId: request.headers?.['X-Request-ID'],
          processedAt: new Date().toISOString()
        }
      }
    };
  }

  getRequestCount(): number {
    return this.requestCount;
  }
}

// Example 2: Authentication plugin as an object
const authPlugin: ContentstackPlugin = {
  onRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    return {
      ...config,
      headers: {
        ...config.headers,
        'X-Custom-Auth': 'Bearer my-custom-token',
        'X-Client-Version': '1.0.0'
      }
    };
  },

  onResponse(request: AxiosRequestConfig, response: AxiosResponse, data: any): AxiosResponse {
    // Remove any sensitive information from the response
    if (data && typeof data === 'object') {
      const sanitized = { ...data };
      delete sanitized.internal_data;
      delete sanitized.debug_info;
      
      return {
        ...response,
        data: sanitized
      };
    }
    
    return response;
  }
};

// Example 3: Performance monitoring plugin
class PerformancePlugin implements ContentstackPlugin {
  private requestTimes = new Map<string, number>();
  private metrics = {
    totalRequests: 0,
    totalTime: 0,
    slowRequests: 0,
    errors: 0
  };

  onRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.requestTimes.set(requestId, performance.now());
    this.metrics.totalRequests++;

    return {
      ...config,
      metadata: {
        ...config.metadata,
        requestId,
        startTime: performance.now()
      }
    };
  }

  onResponse(request: AxiosRequestConfig, response: AxiosResponse, data: any): AxiosResponse {
    const requestId = request.metadata?.requestId;
    const startTime = this.requestTimes.get(requestId);

    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.totalTime += duration;
      
      if (duration > 1000) { // Slow request threshold: 1 second
        this.metrics.slowRequests++;
        console.warn(`[Performance] Slow request detected: ${duration.toFixed(2)}ms for ${request.url}`);
      }
      
      this.requestTimes.delete(requestId);
    }

    if (response.status >= 400) {
      this.metrics.errors++;
    }

    return {
      ...response,
      data: {
        ...data,
        _performance: {
          duration: startTime ? performance.now() - startTime : 0,
          timestamp: new Date().toISOString()
        }
      }
    };
  }

  getMetrics() {
    return {
      ...this.metrics,
      averageTime: this.metrics.totalRequests > 0 
        ? this.metrics.totalTime / this.metrics.totalRequests 
        : 0
    };
  }

  printReport() {
    const metrics = this.getMetrics();
    console.log(`
Performance Report:
- Total Requests: ${metrics.totalRequests}
- Average Response Time: ${metrics.averageTime.toFixed(2)}ms
- Slow Requests: ${metrics.slowRequests}
- Errors: ${metrics.errors}
    `);
  }
}

// Example 4: Caching plugin with TTL
class CachePlugin implements ContentstackPlugin {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  onRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    const cacheKey = this.generateCacheKey(config);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      // In a real implementation, you might want to return cached data directly
      // This is just for demonstration
      console.log(`[Cache] Cache hit for ${cacheKey}`);
      return { ...config, fromCache: true };
    }

    return { ...config, cacheKey };
  }

  onResponse(request: AxiosRequestConfig, response: AxiosResponse, data: any): AxiosResponse {
    if (response.status === 200 && request.cacheKey && !request.fromCache) {
      this.cache.set(request.cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: this.defaultTTL
      });
      console.log(`[Cache] Cached response for ${request.cacheKey}`);
    }

    return response;
  }

  private generateCacheKey(config: AxiosRequestConfig): string {
    return `${config.method || 'GET'}_${config.url}_${JSON.stringify(config.params || {})}`;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Example 5: Error handling and retry plugin
const errorHandlingPlugin: ContentstackPlugin = {
  onRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    return {
      ...config,
      retryAttempts: config.retryAttempts || 0,
      maxRetries: 3
    };
  },

  onResponse(request: AxiosRequestConfig, response: AxiosResponse, data: any): AxiosResponse {
    if (response.status >= 400) {
      console.error(`[Error] HTTP ${response.status}: ${response.statusText} for ${request.url}`);
      
      // Log additional error context
      if (response.status >= 500) {
        console.error('[Error] Server error detected. Consider implementing retry logic.');
      } else if (response.status === 429) {
        console.warn('[Error] Rate limit exceeded. Implementing backoff strategy recommended.');
      }
    }

    return {
      ...response,
      data: {
        ...data,
        _error_handled: response.status >= 400,
        _error_code: response.status >= 400 ? response.status : null
      }
    };
  }
};

// Usage example
function createStackWithPlugins() {
  const loggingPlugin = new LoggingPlugin();
  const performancePlugin = new PerformancePlugin();
  const cachePlugin = new CachePlugin();

  const stack = contentstack.stack({
    apiKey: 'your-api-key',
    deliveryToken: 'your-delivery-token',
    environment: 'your-environment',
    plugins: [
      loggingPlugin,        // Logs all requests/responses
      authPlugin,           // Adds authentication headers
      performancePlugin,    // Monitors performance
      cachePlugin,          // Caches responses
      errorHandlingPlugin   // Handles errors gracefully
    ]
  });

  // You can access plugin methods if needed
  console.log(`Total requests made: ${loggingPlugin.getRequestCount()}`);
  
  // Print performance report
  performancePlugin.printReport();
  
  // Check cache stats
  console.log('Cache stats:', cachePlugin.getCacheStats());

  return stack;
}

// Export for use in other files
export {
  LoggingPlugin,
  PerformancePlugin,
  CachePlugin,
  authPlugin,
  errorHandlingPlugin,
  createStackWithPlugins
};
