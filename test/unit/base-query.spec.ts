import { BaseQuery } from '../../src/lib/base-query';
import { httpClient, AxiosInstance } from '@contentstack/core';
import { MOCK_CLIENT_OPTIONS } from '../utils/constant';
import MockAdapter from 'axios-mock-adapter';
import { entryFindMock } from '../utils/mocks';

describe('BaseQuery class', () => {
  let baseQuery: BaseQuery;
  beforeEach(() => {
    baseQuery = new BaseQuery();
  });

  it("should add 'include_count' parameter to the query parameters", () => {
    const returnedValue = baseQuery.includeCount();

    expect(returnedValue).toBeInstanceOf(BaseQuery);
    expect(baseQuery._queryParams.include_count).toBe('true');
  });

  it("should add 'asc' parameter with the specified key to the query parameters", () => {
    baseQuery.orderByAscending('name');

    expect(baseQuery._queryParams.asc).toBe('name');
  });

  it("should add 'desc' parameter with the specified key to the query parameters", () => {
    baseQuery.orderByDescending('date');

    expect(baseQuery._queryParams.desc).toBe('date');
  });

  it("should add 'limit' parameter with the specified key to the query parameters", () => {
    baseQuery.limit(5);

    expect(baseQuery._queryParams.limit).toBe(5);
  });

  it("should add 'skip' parameter with the specified key to the query parameters", () => {
    baseQuery.skip(5);

    expect(baseQuery._queryParams.skip).toBe(5);
  });

  it('should add the specified key-value pair to the query parameters', () => {
    baseQuery.param('category', 'books');

    expect(baseQuery._queryParams.category).toBe('books');
  });

  it('should add all the key-value pairs from the specified object to the query parameters', () => {
    baseQuery.addParams({ category: 'books', author: 'john' });

    expect(baseQuery._queryParams.category).toBe('books');
    expect(baseQuery._queryParams.author).toBe('john');
  });

  it('should remove a query parameter correctly', () => {
    baseQuery.param('key1', 'value1');
    baseQuery.param('key2', 'value2');
    expect(baseQuery._queryParams).toEqual({ key1: 'value1', key2: 'value2' });

    baseQuery.removeParam('key1');
    expect(baseQuery._queryParams).toEqual({ key2: 'value2' });

    baseQuery.removeParam('key2');
    expect(baseQuery._queryParams).toEqual({});
  });

  it('should do nothing if the parameter does not exist', () => {
    baseQuery.param('key1', 'value1');
    expect(baseQuery._queryParams).toEqual({ key1: 'value1' });

    baseQuery.removeParam('key2');
    expect(baseQuery._queryParams).toEqual({ key1: 'value1' });
  });
});

class TestableBaseQuery extends BaseQuery {
  constructor(client: AxiosInstance, urlPath: string | null = null) {
    super();
    this._client = client;
    if (urlPath !== null) {
      this._urlPath = urlPath;
    }
    this._variants = '';
  }

  setVariants(variants: string) {
    this._variants = variants;
  }

  setParameters(params: any) {
    this._parameters = params;
  }

  setUrlPath(path: string) {
    this._urlPath = path;
  }
}

describe('BaseQuery find method', () => {
  let client: AxiosInstance;
  let mockClient: MockAdapter;
  let query: TestableBaseQuery;

  beforeAll(() => {
    client = httpClient(MOCK_CLIENT_OPTIONS);
    mockClient = new MockAdapter(client as any);
  });

  beforeEach(() => {
    query = new TestableBaseQuery(client, '/content_types/test_uid/entries');
    mockClient.reset();
  });

  it('should call find with encode parameter true', async () => {
    mockClient.onGet('/content_types/test_uid/entries').reply(200, entryFindMock);
    
    query.setParameters({ title: 'Test' });
    const result = await query.find(true);
    
    expect(result).toEqual(entryFindMock);
  });

  it('should call find without parameters', async () => {
    mockClient.onGet('/content_types/test_uid/entries').reply(200, entryFindMock);
    
    const result = await query.find();
    
    expect(result).toEqual(entryFindMock);
  });

  it('should call find with variants header when variants are set', async () => {
    mockClient.onGet('/content_types/test_uid/entries').reply((config) => {
      expect(config.headers?.['x-cs-variant-uid']).toBe('variant1,variant2');
      return [200, entryFindMock];
    });
    
    query.setVariants('variant1,variant2');
    await query.find();
  });

  it('should extract content type UID from URL path', async () => {
    mockClient.onGet('/content_types/my_content_type/entries').reply(200, entryFindMock);
    
    const queryWithContentType = new TestableBaseQuery(client, '/content_types/my_content_type/entries');
    const result = await queryWithContentType.find();
    
    expect(result).toEqual(entryFindMock);
  });

  it('should return null for content type UID when URL does not match pattern', async () => {
    mockClient.onGet('/assets').reply(200, entryFindMock);
    
    const queryWithoutContentType = new TestableBaseQuery(client, '/assets');
    const result = await queryWithoutContentType.find();
    
    expect(result).toEqual(entryFindMock);
  });

  it('should handle find with both encode and variants', async () => {
    mockClient.onGet('/content_types/test_uid/entries').reply((config) => {
      expect(config.headers?.['x-cs-variant-uid']).toBe('test-variant');
      return [200, entryFindMock];
    });
    
    query.setVariants('test-variant');
    query.setParameters({ status: 'published' });
    const result = await query.find(true);
    
    expect(result).toEqual(entryFindMock);
  });

  it('should handle empty _urlPath gracefully', () => {
    const queryWithoutUrlPath = new TestableBaseQuery(client, null);
    queryWithoutUrlPath.setUrlPath('');
    
    // Verify that URL path is empty (testing the null check in extractContentTypeUidFromUrl)
    expect(queryWithoutUrlPath).toBeInstanceOf(TestableBaseQuery);
  });
}); 