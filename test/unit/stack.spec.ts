import { httpClient, AxiosInstance } from '@contentstack/core';
import { jest } from '@jest/globals';
import MockAdapter from 'axios-mock-adapter';
import { Stack } from '../../src/lib/stack';
import { Asset } from '../../src/lib/asset';
import { ContentType } from '../../src/lib/content-type';
import { HOST_URL, LOCALE } from '../utils/constant';
import { syncResult } from '../utils/mocks';
import { synchronization } from '../../src/lib/synchronization';
import { ContentTypeQuery } from '../../src/lib/contenttype-query';
import { AssetQuery } from '../../src/lib/asset-query';
import { StackConfig } from '../../src/lib/types';

jest.mock('../../src/lib/synchronization');
const syncMock = <jest.Mock<typeof synchronization>>(<unknown>synchronization);

describe('Stack class tests', () => {
  let stack: Stack;
  let client: AxiosInstance;
  let mockClient: MockAdapter;

  beforeAll(() => {
    client = httpClient({ defaultHostname: HOST_URL });
    mockClient = new MockAdapter(client as any);
  });

  beforeEach(() => {
    const config = jest.fn().mockReturnValue({
      apiKey: '',
      deliveryToken: '',
      environment: '',
    });

    stack = new Stack(client, config() as StackConfig);
    client.defaults.params = {};
  });
  it('should test import of class Stack', (done) => {
    expect(stack).toBeInstanceOf(Stack);
    done();
  });

  it('should return Asset instance when asset function is called with stack obj', (done) => {
    expect(stack.asset('assetUid')).toBeInstanceOf(Asset);
    expect(stack.asset()).toBeInstanceOf(AssetQuery);
    done();
  });

  it('should return ContentType instance when contentType function is called with stack obj', (done) => {
    expect(stack.contentType('contentTypeUid')).toBeInstanceOf(ContentType);
    expect(stack.contentType()).toBeInstanceOf(ContentTypeQuery);
    done();
  });

  it('should set the correct locale when setLocale function is called with proper locale param', (done) => {
    stack.setLocale(LOCALE);
    expect(stack.config.locale).toEqual(LOCALE);
    done();
  });

  it('should return the syncMock value when sync is called', async () => {
    syncMock.mockReturnValue(syncResult);
    const result = await stack.sync();
    expect(result).toEqual(syncResult);
    syncMock.mockReset();
  });

  it('should set live preview parameters correctly when live_preview is true', (done) => {
    const query = {
      live_preview: 'live_preview_hash',
      contentTypeUid: 'contentTypeUid',
      entryUid: 'entryUid',
      preview_timestamp: 'timestamp',
      include_applied_variants: true,
    };
  
    stack.config.live_preview = { enable: true, live_preview: 'true' };
    stack.livePreviewQuery(query);
  
    expect(stack.getClient().stackConfig.live_preview).toEqual({
      live_preview: 'live_preview_hash',
      contentTypeUid: 'contentTypeUid',
      enable: true,
      entryUid: 'entryUid',
      preview_timestamp: 'timestamp',
      include_applied_variants: true,
    });
    done();
  });
  
  it('should set live preview parameters to null when live_preview is false', () => {
    const query = {
      live_preview: '',
    };
  
    stack.config.live_preview = { enable: false, live_preview: '' };
    stack.livePreviewQuery(query);
  
    expect(stack.getClient().stackConfig.live_preview).toEqual({
      live_preview: '',
      contentTypeUid: '',
      entryUid: '',
      enable: false,
      preview_timestamp: '',
      include_applied_variants: false,
    });
  });
  
  it('should set release_id header when release_id is present in query', () => {
    const query = {
      live_preview: 'live_preview_hash',
      release_id: 'releaseId',
    };
  
    stack.livePreviewQuery(query);
  
    expect(stack.getClient().defaults.headers['release_id']).toEqual('releaseId');
  });
  
  it('should delete release_id header when release_id is not present in query', () => {
    stack.getClient().defaults.headers['release_id'] = 'releaseId';
    const query = { live_preview: 'live_preview_hash'};
  
    stack.livePreviewQuery(query);
  
    expect(stack.getClient().defaults.headers['release_id']).toBeUndefined();
  });
  
  it('should set preview_timestamp header when preview_timestamp is present in query', () => {
    const query = {
      live_preview: 'live_preview_hash',
      preview_timestamp: 'timestamp',
    };
  
    stack.livePreviewQuery(query);
  
    expect(stack.getClient().defaults.headers['preview_timestamp']).toEqual('timestamp');
  });
  
  it('should delete preview_timestamp header when preview_timestamp is not present in query', () => {
    stack.getClient().defaults.headers['preview_timestamp'] = 'timestamp';
    const query = { live_preview: 'live_preview_hash' };
  
    stack.livePreviewQuery(query);
  
    expect(stack.getClient().defaults.headers['preview_timestamp']).toBeUndefined();
  });
});

