import { httpClient, AxiosInstance } from '@contentstack/core';
import { jest } from '@jest/globals';
import MockAdapter from 'axios-mock-adapter';
import { Stack } from '../../src/lib/stack';
import { Asset } from '../../src/lib/asset';
import { ContentType } from '../../src/lib/content-type';
import { HOST_URL, LOCALE } from '../utils/constant';
import { contentTypeQueryFindResponseDataMock, syncResult } from '../utils/mocks';
import { synchronization } from '../../src/lib/synchronization';
import { ContentTypeQuery } from '../../src/lib/contenttype-query';
import { AssetQuery } from '../../src/lib/asset-query';
import { StackConfig } from '../../src/lib/types';
import * as utils from '../../src/lib/utils';

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

  it('should return TaxonomyQuery instance when taxonomy function is called', (done) => {
    const taxonomyQuery = stack.taxonomy();
    expect(taxonomyQuery).toBeDefined();
    done();
  });

  it('should return GlobalField instance when globalField function is called with uid', (done) => {
    const globalField = stack.globalField('globalFieldUid');
    expect(globalField).toBeDefined();
    done();
  });

  it('should return GlobalFieldQuery instance when globalField function is called without uid', (done) => {
    const globalFieldQuery = stack.globalField();
    expect(globalFieldQuery).toBeDefined();
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

  it('should handle livePreviewQuery when live_preview config is not set', () => {
    delete stack.config.live_preview;
    const query = {
      live_preview: 'live_preview_hash',
      release_id: 'releaseId',
    };
  
    stack.livePreviewQuery(query);
  
    expect(stack.getClient().defaults.headers['release_id']).toEqual('releaseId');
  });

  it('should use content_type_uid and entry_uid fallback properties', () => {
    const query = {
      live_preview: 'live_preview_hash',
      content_type_uid: 'contentTypeUid',
      entry_uid: 'entryUid',
    };
  
    stack.config.live_preview = { enable: true, live_preview: 'true' };
    stack.livePreviewQuery(query);
  
    expect(stack.getClient().stackConfig.live_preview).toEqual({
      live_preview: 'live_preview_hash',
      contentTypeUid: 'contentTypeUid',
      enable: true,
      entryUid: 'entryUid',
      preview_timestamp: '',
      include_applied_variants: false,
    });
  });

  it('should return last activities', async () => {
    mockClient.onGet('/content_types').reply(200, contentTypeQueryFindResponseDataMock);
    const response = await stack.getLastActivities();
    expect(response).toEqual(contentTypeQueryFindResponseDataMock);
    expect(response.content_types).toBeDefined();
    expect(Array.isArray(response.content_types)).toBe(true);
  });

  it('should throw error when getLastActivities fails', async () => {
    mockClient.onGet('/content_types').networkError();
    
    await expect(stack.getLastActivities()).rejects.toThrow('Error fetching last activities');
  });

  it('should set port to 3000', () => {
    stack.setPort(3000);
    expect(stack.config.port).toEqual(3000);
  });

  it('should not set port when provided with non-number', () => {
    stack.setPort('3000' as any);
    expect(stack.config.port).not.toEqual('3000');
  });

  it('should set debug to true', () => {
    stack.setDebug(true);
    expect(stack.config.debug).toEqual(true);
  });

  it('should set debug to false', () => {
    stack.setDebug(false);
    expect(stack.config.debug).toEqual(false);
  });

  it('should not set debug when provided with non-boolean', () => {
    stack.config.debug = false;
    stack.setDebug('true' as any);
    expect(stack.config.debug).toEqual(false);
  });

});

