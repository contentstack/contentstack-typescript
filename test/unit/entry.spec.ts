import { AxiosInstance, httpClient } from '@contentstack/core';
import { MOCK_CLIENT_OPTIONS } from '../utils/constant';
import { Entry } from '../../src/lib/entry';
import MockAdapter from 'axios-mock-adapter';
import { entryFetchMock } from '../utils/mocks';
import { getData } from '@contentstack/core';
import { ErrorMessages } from '../../src/lib/error-messages';

describe('Entry class', () => {
  let entry: Entry;
  let client: AxiosInstance;
  let mockClient: MockAdapter;

  beforeAll(() => {
    client = httpClient(MOCK_CLIENT_OPTIONS);
    mockClient = new MockAdapter(client as any);
  });

  beforeEach(() => {
    entry = new Entry(client, 'contentTypeUid', 'entryUid');
  });

  it('should add "locale" in _queryParams when locale method is called', () => {
    const returnedValue = entry.locale('en-us');
    expect(returnedValue).toBeInstanceOf(Entry);
    expect(entry._queryParams.locale).toBe('en-us');
  });

  it('should add "include_branch" in _queryParams when includeBranch method is called', () => {
    const returnedValue = entry.includeBranch();
    expect(returnedValue).toBeInstanceOf(Entry);
    expect(entry._queryParams.include_branch).toBe('true');
  });

  it('should add "include_fallback" in _queryParams when includeFallback method is called', () => {
    const returnedValue = entry.includeFallback();
    expect(returnedValue).toBeInstanceOf(Entry);
    expect(entry._queryParams.include_fallback).toBe('true');
  });

  it('should set the include parameter to the given reference field UID', () => {
    const referenceFieldUid = 'referenceFieldUid';
    const returnedValue = entry.includeReference(referenceFieldUid);
    expect(returnedValue).toBeInstanceOf(Entry);
    expect(entry._queryParams['include[]']).toContain(referenceFieldUid);
  });

  it('should handle multiple reference field UIDs', () => {
    entry.includeReference('ref1', 'ref2', ['ref3', 'ref4']);
    expect(entry._queryParams['include[]']).toEqual(['ref1', 'ref2', 'ref3', 'ref4']);
  });

  it('should log error when includeReference called with no arguments', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    entry.includeReference();
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_ARGUMENT_STRING_OR_ARRAY);
    consoleErrorSpy.mockRestore();
  });

  it('should add "include_metadata" in _queryParams when includeMetadata method is called', () => {
    const returnedValue = entry.includeMetadata();
    expect(returnedValue).toBeInstanceOf(Entry);
    expect(entry._queryParams.include_metadata).toBe('true');
  });

  it('should add "include_embedded_items" in _queryParams when includeEmbeddedItems method is called', () => {
    const returnedValue = entry.includeEmbeddedItems();
    expect(returnedValue).toBeInstanceOf(Entry);
    expect(entry._queryParams['include_embedded_items[]']).toBe('BASE');
  });

  it('should add "include_content_type" in _queryParams when includeContentType method is called', () => {
    const returnedValue = entry.includeContentType();
    expect(returnedValue).toBeInstanceOf(Entry);
    expect(entry._queryParams.include_content_type).toBe('true');
  });
  
  it('should add a fieldUid to the _queryParams object', () => {
    entry.only('fieldUid');
    expect(entry._queryParams).toEqual({ 'only[BASE][]': 'fieldUid' });
  });

  it('should return an instance of Entry', () => {
    const result = entry.only('fieldUid');
    expect(result).toBeInstanceOf(Entry);
  });

  it('should allow chaining of multiple calls', () => {
    entry.only('fieldUid1').only('fieldUid2');
    expect(entry._queryParams).toEqual({ 'only[BASE][]': 'fieldUid2' });
  });

  it('should handle only with array of fieldUids', () => {
    entry.only(['field1', 'field2', 'field3']);
    expect(entry._queryParams['only[BASE][0]']).toBe('field1');
    expect(entry._queryParams['only[BASE][1]']).toBe('field2');
    expect(entry._queryParams['only[BASE][2]']).toBe('field3');
  });

  it('should add a fieldUid to the _queryParams object', () => {
    entry.except('fieldUid');
    expect(entry._queryParams).toEqual({ 'except[BASE][]': 'fieldUid' });
  });

  it('should return an instance of Entry', () => {
    const result = entry.except('fieldUid');
    expect(result).toBeInstanceOf(Entry);
  });

  it('should allow chaining of multiple calls', () => {
    entry.except('fieldUid1').except('fieldUid2');
    expect(entry._queryParams).toEqual({ 'except[BASE][]': 'fieldUid2' });
  });

  it('should handle except with array of fieldUids', () => {
    entry.except(['field1', 'field2', 'field3']);
    expect(entry._queryParams['except[BASE][0]']).toBe('field1');
    expect(entry._queryParams['except[BASE][1]']).toBe('field2');
    expect(entry._queryParams['except[BASE][2]']).toBe('field3');
  });

  it('should add params to _queryParams using addParams', () => {
    const params = { key1: 'value1', key2: 123, key3: ['value3'] };
    const returnedValue = entry.addParams(params);
    expect(returnedValue).toBeInstanceOf(Entry);
    expect(entry._queryParams.key1).toBe('value1');
    expect(entry._queryParams.key2).toBe(123);
    expect(entry._queryParams.key3).toEqual(['value3']);
  });

  it('should add "asset_fields[]" in _queryParams when assetFields method is called', () => {
    const returnedValue = entry.assetFields('user_defined_fields', 'embedded', 'ai_suggested', 'visual_markups');
    expect(returnedValue).toBeInstanceOf(Entry);
    expect(entry._queryParams['asset_fields[]']).toEqual(['user_defined_fields', 'embedded', 'ai_suggested', 'visual_markups']);
  });

  it('should not set asset_fields[] when assetFields is called with no arguments', () => {
    entry.assetFields();
    expect(entry._queryParams['asset_fields[]']).toBeUndefined();
  });

  it('should get the API response when fetch method is called', async () => {
    mockClient.onGet(`/content_types/contentTypeUid/entries/entryUid`).reply(200, entryFetchMock);
    const returnedValue = await entry.fetch();
    
    expect(returnedValue).toEqual(entryFetchMock.entry);
  });
});

class TestVariants extends Entry {
  constructor(client: AxiosInstance) {
    super(client, 'xyz', 'abc');
    this._client = client;
  }

  setAndGetVariantsHeaders(): string {
    this.variants(['variant1', 'variant2']); // setting the variants headers so it doesnt give empty string
    return this._variants || "";
  }

  getVariants(): string {
    return this._variants || "";
  }
}

describe('Variants test', () => {
  let client: AxiosInstance;
  let mockClient: MockAdapter;

  beforeAll(() => {
    client = httpClient(MOCK_CLIENT_OPTIONS);
    mockClient = new MockAdapter(client as any);
  });
  it('should get the correct variant headers added to client', async () => {
    const testVariantObj = new TestVariants(httpClient(MOCK_CLIENT_OPTIONS))

    expect(testVariantObj.setAndGetVariantsHeaders()).toBe('variant1,variant2');
  });

  it('should set variants as string', () => {
    const testVariantObj = new TestVariants(client);
    testVariantObj.variants('variant1');
    expect(testVariantObj.getVariants()).toBe('variant1');
  });

  it('should set variants as comma-separated string from array', () => {
    const testVariantObj = new TestVariants(client);
    testVariantObj.variants(['variant1', 'variant2', 'variant3']);
    expect(testVariantObj.getVariants()).toBe('variant1,variant2,variant3');
  });

  it('should not set variants when empty string is provided', () => {
    const testVariantObj = new TestVariants(client);
    testVariantObj.variants('');
    expect(testVariantObj.getVariants()).toBe('');
  });

  it('should not set variants when empty array is provided', () => {
    const testVariantObj = new TestVariants(client);
    testVariantObj.variants([]);
    expect(testVariantObj.getVariants()).toBe('');
  });
});

describe('Fetch with variants', () => {
  let client: AxiosInstance;
  let mockClient: MockAdapter;
  let entry: Entry;

  beforeAll(() => {
    client = httpClient(MOCK_CLIENT_OPTIONS);
    mockClient = new MockAdapter(client as any);
  });

  beforeEach(() => {
    entry = new Entry(client, 'contentTypeUid', 'entryUid');
    mockClient.reset();
  });

  it('should call fetch with variants header when variants are set', async () => {
    mockClient.onGet('/content_types/contentTypeUid/entries/entryUid').reply((config) => {
      expect(config.headers?.['x-cs-variant-uid']).toBe('variant1,variant2');
      return [200, entryFetchMock];
    });
    
    entry.variants(['variant1', 'variant2']);
    const result = await entry.fetch();
    
    expect(result).toEqual(entryFetchMock.entry);
  });

  it('should call fetch without variant header when variants are not set', async () => {
    mockClient.onGet('/content_types/contentTypeUid/entries/entryUid').reply((config) => {
      expect(config.headers?.['x-cs-variant-uid']).toBeUndefined();
      return [200, entryFetchMock];
    });
    
    const result = await entry.fetch();
    
    expect(result).toEqual(entryFetchMock.entry);
  });

  it('should return response directly when entry property is not present', async () => {
    const responseWithoutEntry = { data: 'test', uid: 'test-uid' };
    mockClient.onGet('/content_types/contentTypeUid/entries/entryUid').reply(200, responseWithoutEntry);
    
    const result = await entry.fetch();
    
    expect(result).toEqual(responseWithoutEntry);
  });

  it('should call fetch with asset_fields[] query params when assetFields is set', async () => {
    mockClient.onGet('/content_types/contentTypeUid/entries/entryUid').reply((config) => {
      expect(config.params).toBeDefined();
      expect(config.params['asset_fields[]']).toEqual(['user_defined_fields', 'embedded', 'ai_suggested', 'visual_markups']);
      return [200, entryFetchMock];
    });

    entry.assetFields('user_defined_fields', 'embedded', 'ai_suggested', 'visual_markups');
    const result = await entry.fetch();

    expect(result).toEqual(entryFetchMock.entry);
  });
})
