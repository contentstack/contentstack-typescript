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

  it('(g) retryCondition that throws is caught — structured warning logged and SDK falls back to default retry', async () => {
    const warnPayloads: any[] = [];
    const throwingCondition = () => { throw new Error('boom'); };
    const config: StackConfig = {
      apiKey: 'TEST-API-KEY',
      deliveryToken: 'TEST-DELIVERY-TOKEN',
      environment: 'TEST-ENVIRONMENT',
      retryDelay: 10,
      retryCondition: throwingCondition,
      logHandler: (level: string, msg: any) => {
        if (level === 'warn') warnPayloads.push(msg);
      },
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
    expect(warnPayloads.length).toBeGreaterThan(0);
    expect(warnPayloads[0]).toEqual(expect.objectContaining({ type: 'retry_condition_error' }));
    expect(warnPayloads[0].message).toContain('[Contentstack SDK]');
    expect(warnPayloads[0].message).toContain('boom');
  });

  it('(h1) retryCondition throws a non-Error (string) — ?? fallback logs the raw thrown value', async () => {
    const warnPayloads: any[] = [];
    const throwingCondition = () => { throw 'not-an-error-object'; };
    const config: StackConfig = {
      apiKey: 'TEST-API-KEY',
      deliveryToken: 'TEST-DELIVERY-TOKEN',
      environment: 'TEST-ENVIRONMENT',
      retryDelay: 10,
      retryCondition: throwingCondition,
      logHandler: (level: string, msg: any) => {
        if (level === 'warn') warnPayloads.push(msg);
      },
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
    expect(warnPayloads[0]).toEqual(expect.objectContaining({ type: 'retry_condition_error' }));
    // message uses the raw thrown value via the ?? fallback since it has no .message
    expect(warnPayloads[0].message).toContain('not-an-error-object');
  });

  it('(h) retryCondition that throws with no logHandler — SDK falls back silently without throwing', async () => {
    const throwingCondition = () => { throw new Error('boom'); };
    const config: StackConfig = {
      apiKey: 'TEST-API-KEY',
      deliveryToken: 'TEST-DELIVERY-TOKEN',
      environment: 'TEST-ENVIRONMENT',
      retryDelay: 10,
      retryCondition: throwingCondition,
      // no logHandler — exercises the logHandler?. undefined branch
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

  it('(k) retryCondition returning true triggers retry even for non-transient-code errors', async () => {
    // Covers the `if (config.retryCondition?.(error)) return true` branch.
    const alwaysRetry = jest.fn().mockReturnValue(true);
    const config: StackConfig = {
      apiKey: 'TEST-API-KEY',
      deliveryToken: 'TEST-DELIVERY-TOKEN',
      environment: 'TEST-ENVIRONMENT',
      retryDelay: 10,
      retryCondition: alwaysRetry,
    };
    const stack = Contentstack.stack(config);
    const client = stack.getClient();
    mockClient = new MockAdapter(client);

    // Use a generic error with no recognized code — only user retryCondition covers it.
    const genericError = (cfg: any) =>
      Promise.reject(Object.assign(new Error('generic'), { config: cfg, isAxiosError: true }));

    mockClient
      .onGet('/content_types/test')
      .replyOnce(genericError)
      .onGet('/content_types/test')
      .reply(200, { content_types: [] });

    const res = await client.get('/content_types/test');
    expect(res.status).toBe(200);
    expect(alwaysRetry).toHaveBeenCalled();
  });

  it('(i) retryOnError: false disables network-error retries — ENOTFOUND throws immediately', async () => {
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

  it('(j) retryLimit: 0 disables network-error retries — ENOTFOUND throws immediately', async () => {
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
