import * as Contentstack from '../../src/stack';
import { StackConfig } from '../../src/common/types';
import MockAdapter from 'axios-mock-adapter';

describe('Default network-error retry behavior', () => {
  let mockClient: MockAdapter | undefined;

  afterEach(() => {
    mockClient?.restore();
    mockClient = undefined;
  });

  const dnsError = (code: string) => (config: any) =>
    Promise.reject(
      Object.assign(new Error(`getaddrinfo ${code} example.com`), {
        code,
        config,
        isAxiosError: true,
      })
    );

  it('(a) retries and succeeds after a single transient ENOTFOUND failure with no custom retryCondition', async () => {
    const config: StackConfig = {
      apiKey: 'TEST-API-KEY',
      deliveryToken: 'TEST-DELIVERY-TOKEN',
      environment: 'TEST-ENVIRONMENT',
      retryDelay: 10,
    };
    const stack = Contentstack.stack(config);
    const client = stack.getClient();
    mockClient = new MockAdapter(client);

    mockClient
      .onGet('/content_types/test')
      .replyOnce(dnsError('ENOTFOUND'))
      .onGet('/content_types/test')
      .reply(200, { content_types: [] });

    const res = await client.get('/content_types/test');
    expect(res.status).toBe(200);
  });

  it('(b) still fails after retryLimit is exhausted on a permanent network failure', async () => {
    const config: StackConfig = {
      apiKey: 'TEST-API-KEY',
      deliveryToken: 'TEST-DELIVERY-TOKEN',
      environment: 'TEST-ENVIRONMENT',
      retryLimit: 2,
      retryDelay: 10,
    };
    const stack = Contentstack.stack(config);
    const client = stack.getClient();
    mockClient = new MockAdapter(client);

    mockClient.onGet('/content_types/test').reply(dnsError('ENOTFOUND'));

    await expect(client.get('/content_types/test')).rejects.toBeDefined();
  });

  it('(c) composes with a user-supplied retryCondition without replacing it', async () => {
    const userCondition = jest.fn((error: any) => error?.response?.status === 500);
    const config: StackConfig = {
      apiKey: 'TEST-API-KEY',
      deliveryToken: 'TEST-DELIVERY-TOKEN',
      environment: 'TEST-ENVIRONMENT',
      retryDelay: 10,
      retryCondition: userCondition,
    };
    const stack = Contentstack.stack(config);
    const client = stack.getClient();
    mockClient = new MockAdapter(client);

    mockClient
      .onGet('/content_types/test')
      .replyOnce(dnsError('ECONNRESET'))
      .onGet('/content_types/test')
      .reply(200, { content_types: [] });

    const res = await client.get('/content_types/test');
    expect(res.status).toBe(200);
    // config is never mutated — stack.config.retryCondition stays the exact
    // user-supplied function, matching the identity assertion already made
    // by test/unit/retry-configuration.spec.ts.
    expect(stack.config.retryCondition).toBe(userCondition);
  });

  it('(d) ECONNABORTED (axios timeout) is NOT retried — core classifies it as a structured TIMEOUT error', async () => {
    // ECONNABORTED is excluded from TRANSIENT_NETWORK_ERROR_CODES so that
    // @contentstack/core can surface it as { error_code: "TIMEOUT" } (#239).
    // Retrying it here would bypass that structured classification.
    const config: StackConfig = {
      apiKey: 'TEST-API-KEY',
      deliveryToken: 'TEST-DELIVERY-TOKEN',
      environment: 'TEST-ENVIRONMENT',
      retryDelay: 10,
    };
    const stack = Contentstack.stack(config);
    const client = stack.getClient();
    mockClient = new MockAdapter(client);

    mockClient.onGet('/content_types/test').timeout();

    await expect(client.get('/content_types/test')).rejects.toBeDefined();
  });

  it('(e) ENETUNREACH and ETIMEDOUT (the customer-reported codes) are retried', async () => {
    for (const code of ['ENETUNREACH', 'ETIMEDOUT'] as const) {
      const config: StackConfig = {
        apiKey: 'TEST-API-KEY',
        deliveryToken: 'TEST-DELIVERY-TOKEN',
        environment: 'TEST-ENVIRONMENT',
        retryDelay: 10,
      };
      const stack = Contentstack.stack(config);
      const client = stack.getClient();
      const mock = new MockAdapter(client);

      mock
        .onGet('/content_types/test')
        .replyOnce(dnsError(code))
        .onGet('/content_types/test')
        .reply(200, { content_types: [] });

      const res = await client.get('/content_types/test');
      expect(res.status).toBe(200);
      mock.restore();
    }
  });

  it('(f) EAI_AGAIN (DNS servfail, intermittent) is retried', async () => {
    const config: StackConfig = {
      apiKey: 'TEST-API-KEY',
      deliveryToken: 'TEST-DELIVERY-TOKEN',
      environment: 'TEST-ENVIRONMENT',
      retryDelay: 10,
    };
    const stack = Contentstack.stack(config);
    const client = stack.getClient();
    mockClient = new MockAdapter(client);

    mockClient
      .onGet('/content_types/test')
      .replyOnce(dnsError('EAI_AGAIN'))
      .onGet('/content_types/test')
      .reply(200, { content_types: [] });

    const res = await client.get('/content_types/test');
    expect(res.status).toBe(200);
  });

  it('(g) retryOnError: false disables network-error retries — ENOTFOUND throws immediately', async () => {
    const config: StackConfig = {
      apiKey: 'TEST-API-KEY',
      deliveryToken: 'TEST-DELIVERY-TOKEN',
      environment: 'TEST-ENVIRONMENT',
      retryOnError: false,
      retryDelay: 10,
    };
    const stack = Contentstack.stack(config);
    const client = stack.getClient();
    mockClient = new MockAdapter(client);

    // Second route intentionally registered — if the SDK retried it would succeed,
    // proving the test would only pass when retryOnError: false truly disables retry.
    mockClient
      .onGet('/content_types/test')
      .replyOnce(dnsError('ENOTFOUND'))
      .onGet('/content_types/test')
      .reply(200, { content_types: [] });

    await expect(client.get('/content_types/test')).rejects.toBeDefined();
  });

  it('(h) retryLimit: 0 disables network-error retries — ENOTFOUND throws immediately', async () => {
    const config: StackConfig = {
      apiKey: 'TEST-API-KEY',
      deliveryToken: 'TEST-DELIVERY-TOKEN',
      environment: 'TEST-ENVIRONMENT',
      retryLimit: 0,
      retryDelay: 10,
    };
    const stack = Contentstack.stack(config);
    const client = stack.getClient();
    mockClient = new MockAdapter(client);

    // Second route intentionally registered — if the SDK retried it would succeed,
    // proving the test would only pass when retryLimit: 0 truly disables retry.
    mockClient
      .onGet('/content_types/test')
      .replyOnce(dnsError('ENOTFOUND'))
      .onGet('/content_types/test')
      .reply(200, { content_types: [] });

    await expect(client.get('/content_types/test')).rejects.toBeDefined();
  });
});
