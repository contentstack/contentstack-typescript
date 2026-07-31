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
      apiKey: 'test-api-key',
      deliveryToken: 'test-delivery-token',
      environment: 'test-environment',
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
      apiKey: 'test-api-key',
      deliveryToken: 'test-delivery-token',
      environment: 'test-environment',
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
      apiKey: 'test-api-key',
      deliveryToken: 'test-delivery-token',
      environment: 'test-environment',
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

  it('(d) ECONNABORTED/timeout errors are unaffected by the new network-retry path', async () => {
    const config: StackConfig = {
      apiKey: 'test-api-key',
      deliveryToken: 'test-delivery-token',
      environment: 'test-environment',
      retryDelay: 10,
    };
    const stack = Contentstack.stack(config);
    const client = stack.getClient();
    mockClient = new MockAdapter(client);

    mockClient.onGet('/content_types/test').timeout();

    await expect(client.get('/content_types/test')).rejects.toBeDefined();
  });
});
