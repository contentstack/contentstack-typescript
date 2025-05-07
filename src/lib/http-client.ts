import fetch from 'isomorphic-unfetch';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { StackConfig } from './types';

export interface HttpClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

export class HttpClient {
  private config: HttpClientConfig;
  private baseURL: string;
  private headers: Record<string, string>;
  private params: Record<string, any>;
  private requestInterceptor: any;
  private responseInterceptor: any;
  public defaults: {
    headers: Record<string, string>;
    params: Record<string, any>;
  };

  constructor(config: StackConfig) {
    this.config = {
      baseURL: this.getBaseURL(config),
      headers: this.getHeaders(config),
      params: this.getParams(config)
    };
    this.baseURL = this.config.baseURL || '';
    this.headers = this.config.headers || {};
    this.params = this.config.params || {};
    this.defaults = {
      headers: this.headers,
      params: this.params
    };
  }

  private getBaseURL(config: StackConfig): string {
    const region = config.region || 'us';
    const host = config.host || `cdn.contentstack.io`;
    return `https://${host}`;
  }

  private getHeaders(config: StackConfig): Record<string, string> {
    return {
      'api_key': config.apiKey,
      'access_token': config.deliveryToken,
      'Content-Type': 'application/json'
    };
  }

  private getParams(config: StackConfig): Record<string, any> {
    const params: Record<string, any> = {
      environment: config.environment
    };
    if (config.locale) {
      params.locale = config.locale;
    }
    if (config.branch) {
      params.branch = config.branch;
    }
    return params;
  }

  private async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const { url, method = 'GET', data, params, headers = {} } = config;
    
    // Merge query parameters
    const queryParams = new URLSearchParams({
      ...this.params,
      ...params
    });
    
    // Build URL
    const fullUrl = `${this.baseURL}${url}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    // Merge headers
    const mergedHeaders: Record<string, string> = {
      ...this.headers,
      ...headers as Record<string, string>,
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: mergedHeaders,
        body: data ? JSON.stringify(data) : undefined
      });

      const responseData = await response.json();

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        config: config as any,
        request: {} as any
      };
    } catch (error) {
      throw error;
    }
  }

  async get<T>(url: string, options: { params?: Record<string, any>; headers?: Record<string, string> } = {}): Promise<{ data: T }> {
    const queryParams = new URLSearchParams();
    Object.entries({ ...this.params, ...options.params }).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    const headers = { ...this.headers, ...options.headers };

    const response = await fetch(`${this.baseURL}${url}?${queryParams.toString()}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  }

  // Add interceptors to maintain compatibility with Axios
  interceptors = {
    request: {
      use: (handler: any) => {
        this.requestInterceptor = handler;
      }
    },
    response: {
      use: (handler: any) => {
        this.responseInterceptor = handler;
      }
    }
  };
} 