import { AxiosInstance, HttpClientParams, httpClient } from '@contentstack/core';
import { Asset } from '../../src/lib/asset';
import MockAdapter from 'axios-mock-adapter';
import { assetFetchDataMock } from '../utils/mocks';
import { MOCK_CLIENT_OPTIONS } from '../utils/constant';

describe('Asset class', () => {
  let asset: Asset;
  let client: AxiosInstance;
  let mockClient: MockAdapter;

  beforeAll(() => {
    client = httpClient(MOCK_CLIENT_OPTIONS);
    mockClient = new MockAdapter(client as any);
  });

  beforeEach(() => {
    asset = new Asset(client, 'assetUid');
  });

  it('should add "locale" in _queryParams when locale method is called', () => {
    const returnedValue = asset.locale('en-us');
    expect(returnedValue).toBeInstanceOf(Asset);
    expect(asset._queryParams.locale).toBe('en-us');
  });

  it('should add "include_dimension" in _queryParams when includeDimension method is called', () => {
    const returnedValue = asset.includeDimension();
    expect(returnedValue).toBeInstanceOf(Asset);
    expect(asset._queryParams.include_dimension).toBe('true');
  });

  it('should add "include_branch" in _queryParams when includeBranch method is called', () => {
    const returnedValue = asset.includeBranch();
    expect(returnedValue).toBeInstanceOf(Asset);
    expect(asset._queryParams.include_branch).toBe('true');
  });

  it('should add "include_fallback" in _queryParams when includeFallback method is called', () => {
    const returnedValue = asset.includeFallback();
    expect(returnedValue).toBeInstanceOf(Asset);
    expect(asset._queryParams.include_fallback).toBe('true');
  });

  it('should add "include_metadata" in _queryParams when includeMetadata method is called', () => {
    const returnedValue = asset.includeMetadata();
    expect(returnedValue).toBeInstanceOf(Asset);
    expect(asset._queryParams.include_metadata).toBe('true');
  });

  it('should add "relative_urls" in _queryParams when relativeUrl method is called', () => {
    const returnedValue = asset.relativeUrls();
    expect(returnedValue).toBeInstanceOf(Asset);
    expect(asset._queryParams.relative_urls).toBe('true');
  });

  it('should add "version" in _queryParams when version method is called', () => {
    const returnedValue = asset.version(1);
    expect(returnedValue).toBeInstanceOf(Asset);
    expect(asset._queryParams.version).toBe('1');
  });

  it('should add "asset_fields[]" in _queryParams when assetFields method is called', () => {
    const returnedValue = asset.assetFields('user_defined_fields', 'embedded', 'ai_suggested', 'visual_markups');
    expect(returnedValue).toBeInstanceOf(Asset);
    expect(asset._queryParams['asset_fields[]']).toEqual(['user_defined_fields', 'embedded', 'ai_suggested', 'visual_markups']);
  });

  it('should not set asset_fields[] when assetFields is called with no arguments', () => {
    asset.assetFields();
    expect(asset._queryParams['asset_fields[]']).toBeUndefined();
  });

  it('should add "fetch" in _queryParams when fetch method is called', async () => {
    mockClient.onGet(`/assets/assetUid`).reply(200, assetFetchDataMock);
    const returnedValue = await asset.fetch();
    expect(returnedValue).toEqual(assetFetchDataMock.asset);
  });

  it('should return response directly when asset property is not present', async () => {
    const responseWithoutAsset = { data: 'test', uid: 'test-uid' };
    mockClient.onGet(`/assets/assetUid`).reply(200, responseWithoutAsset);
    
    const result = await asset.fetch();
    
    expect(result).toEqual(responseWithoutAsset);
  });

  it('should call fetch with asset_fields[] query params when assetFields is set', async () => {
    mockClient.onGet(`/assets/assetUid`).reply((config) => {
      expect(config.params).toBeDefined();
      expect(config.params['asset_fields[]']).toEqual(['user_defined_fields', 'embedded', 'ai_suggested', 'visual_markups']);
      return [200, assetFetchDataMock];
    });
    asset.assetFields('user_defined_fields', 'embedded', 'ai_suggested', 'visual_markups');
    const result = await asset.fetch();
    expect(result).toEqual(assetFetchDataMock.asset);
  });
});
