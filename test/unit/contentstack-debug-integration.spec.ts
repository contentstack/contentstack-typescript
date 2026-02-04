import { httpClient, AxiosInstance } from '@contentstack/core';
import * as Contentstack from '../../src/lib/contentstack';
import { Stack } from '../../src/lib/stack';
import { Policy, StackConfig } from '../../src/lib/types';
import MockAdapter from 'axios-mock-adapter';

describe('Contentstack Debug Logging Integration', () => {
  let mockLogHandler: jest.Mock;

  beforeEach(() => {
    mockLogHandler = jest.fn();
  });

  it('should execute debug logging for request interceptor', async () => {
    const config: StackConfig = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      debug: true,
      logHandler: mockLogHandler,
    };

    const stack = Contentstack.stack(config);
    const client = stack.getClient();
    const mockClient = new MockAdapter(client);

    mockClient.onGet('/content_types/test').reply(200, {
      content_types: []
    });

    // Make an actual request to trigger interceptors
    try {
      await client.get('/content_types/test');
    } catch (e) {
      // Ignore errors
    }

    // Verify request logging was called
    const requestLogs = mockLogHandler.mock.calls.filter((call: any) => 
      call[1]?.type === 'request'
    );
    expect(requestLogs.length).toBeGreaterThan(0);

    mockClient.restore();
  });

  it('should execute debug logging for response interceptor with 2xx status', async () => {
    const config: StackConfig = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      debug: true,
      logHandler: mockLogHandler,
    };

    const stack = Contentstack.stack(config);
    const client = stack.getClient();
    const mockClient = new MockAdapter(client);

    mockClient.onGet('/content_types/test').reply(200, {
      content_types: []
    });

    await client.get('/content_types/test');

    // Verify response logging was called with info level
    const responseLogs = mockLogHandler.mock.calls.filter((call: any) => 
      call[1]?.type === 'response' && call[0] === 'info'
    );
    expect(responseLogs.length).toBeGreaterThan(0);

    mockClient.restore();
  });

  it('should execute debug logging for response interceptor with 3xx status', async () => {
    const config: StackConfig = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      debug: true,
      logHandler: mockLogHandler,
    };

    const stack = Contentstack.stack(config);
    const client = stack.getClient();
    const mockClient = new MockAdapter(client);

    // 3xx responses are treated as errors by axios-mock-adapter
    mockClient.onGet('/content_types/test').reply(304, {});

    try {
      await client.get('/content_types/test');
    } catch (e) {
      // Expected - 3xx responses trigger error handler in mock adapter
    }

    // Verify error response logging was called - 3xx goes through error interceptor
    const errorLogs = mockLogHandler.mock.calls.filter((call: any) => 
      call[1]?.type === 'response_error' && call[1]?.status === 304
    );
    expect(errorLogs.length).toBeGreaterThan(0);

    mockClient.restore();
  });

  it('should execute debug logging for error response interceptor with 4xx status', async () => {
    const config: StackConfig = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      debug: true,
      logHandler: mockLogHandler,
    };

    const stack = Contentstack.stack(config);
    const client = stack.getClient();
    const mockClient = new MockAdapter(client);

    mockClient.onGet('/content_types/test').reply(404, {
      error: 'Not found'
    });

    try {
      await client.get('/content_types/test');
    } catch (e) {
      // Expected error
    }

    // Verify error logging was called
    const errorLogs = mockLogHandler.mock.calls.filter((call: any) => 
      call[1]?.type === 'response_error' && call[0] === 'error'
    );
    expect(errorLogs.length).toBeGreaterThan(0);

    mockClient.restore();
  });

  it('should execute debug logging for error response without status', async () => {
    const config: StackConfig = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      debug: true,
      logHandler: mockLogHandler,
    };

    const stack = Contentstack.stack(config);
    const client = stack.getClient();
    const mockClient = new MockAdapter(client);

    mockClient.onGet('/content_types/test').networkError();

    try {
      await client.get('/content_types/test');
    } catch (e) {
      // Expected network error
    }

    // Verify error logging was called with debug level for no status
    const errorLogs = mockLogHandler.mock.calls.filter((call: any) => 
      call[1]?.type === 'response_error' && call[0] === 'debug'
    );
    expect(errorLogs.length).toBeGreaterThan(0);

    mockClient.restore();
  });

  const mockPersistanceStore = { setItem: jest.fn(), getItem: jest.fn() };

  it('should set cache adapter when cacheOptions is provided', () => {
    const config: StackConfig = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      cacheOptions: {
        policy: Policy.CACHE_THEN_NETWORK,
        maxAge: 3600,
        persistanceStore: mockPersistanceStore,
      },
    };

    const stack = Contentstack.stack(config);
    const client = stack.getClient();

    // Verify the custom adapter was set
    const customAdapter = client.defaults.adapter;
    expect(customAdapter).toBeDefined();
    expect(typeof customAdapter).toBe('function');
  });

  it('should set cache adapter with NETWORK_ELSE_CACHE policy', () => {
    const config: StackConfig = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      cacheOptions: {
        policy: Policy.NETWORK_ELSE_CACHE,
        maxAge: 3600,
        persistanceStore: mockPersistanceStore,
      },
    };

    const stack = Contentstack.stack(config);
    const client = stack.getClient();

    const customAdapter = client.defaults.adapter;
    expect(customAdapter).toBeDefined();
    expect(typeof customAdapter).toBe('function');
  });

  it('should set cache adapter with CACHE_ELSE_NETWORK policy', () => {
    const config: StackConfig = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      cacheOptions: {
        policy: Policy.CACHE_ELSE_NETWORK,
        maxAge: 3600,
        persistanceStore: mockPersistanceStore,
      },
    };

    const stack = Contentstack.stack(config);
    const client = stack.getClient();

    const customAdapter = client.defaults.adapter;
    expect(customAdapter).toBeDefined();
    expect(typeof customAdapter).toBe('function');
  });
});

