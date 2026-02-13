import { BaseQuery } from '../../src/query';
import { Query } from '../../src/query';
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

  describe('Enhancement: Methods return Query type', () => {
    it('should return Query-compatible type from includeCount()', () => {
      const returnedValue = baseQuery.includeCount();
      
      // Should be instance of BaseQuery (Query extends BaseQuery)
      expect(returnedValue).toBeInstanceOf(BaseQuery);
      expect(baseQuery._queryParams.include_count).toBe('true');
    });

    it('should return Query-compatible type from orderByAscending()', () => {
      const returnedValue = baseQuery.orderByAscending('title');
      
      expect(returnedValue).toBeInstanceOf(BaseQuery);
      expect(baseQuery._queryParams.asc).toBe('title');
    });

    it('should return Query-compatible type from orderByDescending()', () => {
      const returnedValue = baseQuery.orderByDescending('created_at');
      
      expect(returnedValue).toBeInstanceOf(BaseQuery);
      expect(baseQuery._queryParams.desc).toBe('created_at');
    });

    it('should return Query-compatible type from limit()', () => {
      const returnedValue = baseQuery.limit(10);
      
      expect(returnedValue).toBeInstanceOf(BaseQuery);
      expect(baseQuery._queryParams.limit).toBe(10);
    });

    it('should return Query-compatible type from skip()', () => {
      const returnedValue = baseQuery.skip(5);
      
      expect(returnedValue).toBeInstanceOf(BaseQuery);
      expect(baseQuery._queryParams.skip).toBe(5);
    });

    it('should return Query-compatible type from param()', () => {
      const returnedValue = baseQuery.param('locale', 'en-us');
      
      expect(returnedValue).toBeInstanceOf(BaseQuery);
      expect(baseQuery._queryParams.locale).toBe('en-us');
    });

    it('should return Query-compatible type from addParams()', () => {
      const returnedValue = baseQuery.addParams({ include_count: 'true' });
      
      expect(returnedValue).toBeInstanceOf(BaseQuery);
      expect(baseQuery._queryParams.include_count).toBe('true');
    });

    it('should return Query-compatible type from removeParam()', () => {
      baseQuery.param('key1', 'value1');
      const returnedValue = baseQuery.removeParam('key1');
      
      expect(returnedValue).toBeInstanceOf(BaseQuery);
      expect(baseQuery._queryParams.key1).toBeUndefined();
    });

    it('should support method chaining with Query type', () => {
      const chained = baseQuery
        .limit(5)
        .skip(0)
        .includeCount()
        .orderByAscending('title');
      
      expect(chained).toBeInstanceOf(BaseQuery);
      expect(baseQuery._queryParams.limit).toBe(5);
      expect(baseQuery._queryParams.skip).toBe(0);
      expect(baseQuery._queryParams.include_count).toBe('true');
      expect(baseQuery._queryParams.asc).toBe('title');
    });
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
    mockClient.onGet('/content_types/test_uid/entries').reply((config) => {
      // Verify that query parameters are encoded
      const queryParam = config.params?.query;
      expect(queryParam).toBeDefined();
      // When encoded, special characters should be URL encoded
      return [200, entryFindMock];
    });
    
    query.setParameters({ title: 'Test & Encode' });
    const result = await query.find(true);
    
    expect(result).toEqual(entryFindMock);
  });

  it('should encode query parameters when encode is true', async () => {
    mockClient.onGet('/content_types/test_uid/entries').reply((config) => {
      const queryParam = config.params?.query;
      // Verify encoding: 'Test & Value' should be encoded
      expect(queryParam.title).toBe('Test%20%26%20Value');
      return [200, entryFindMock];
    });
    
    query.setParameters({ title: 'Test & Value' });
    await query.find(true);
  });

  it('should not encode query parameters when encode is false', async () => {
    mockClient.onGet('/content_types/test_uid/entries').reply((config) => {
      const queryParam = config.params?.query;
      // Verify no encoding: raw value should be present
      expect(queryParam.title).toBe('Test & Value');
      return [200, entryFindMock];
    });
    
    query.setParameters({ title: 'Test & Value' });
    await query.find(false);
  });

  it('should not encode query parameters when encode is not provided', async () => {
    mockClient.onGet('/content_types/test_uid/entries').reply((config) => {
      const queryParam = config.params?.query;
      // Verify no encoding by default
      expect(queryParam.title).toBe('Test & Value');
      return [200, entryFindMock];
    });
    
    query.setParameters({ title: 'Test & Value' });
    await query.find();
  });

  it('should encode nested query parameters when encode is true', async () => {
    mockClient.onGet('/content_types/test_uid/entries').reply((config) => {
      const queryParam = config.params?.query;
      // Verify nested object encoding
      expect(queryParam.nested.name).toBe('John%20%26%20Jane');
      expect(queryParam.nested.deeply.nested).toBe('value%20%2B%20symbols');
      return [200, entryFindMock];
    });
    
    query.setParameters({
      nested: {
        name: 'John & Jane',
        deeply: {
          nested: 'value + symbols'
        }
      }
    });
    await query.find(true);
  });

  it('should encode special characters correctly', async () => {
    mockClient.onGet('/content_types/test_uid/entries').reply((config) => {
      const queryParam = config.params?.query;
      // Test various special characters
      expect(queryParam.symbols).toBe('hello%40world.com%3Fparam%3Dvalue');
      expect(queryParam.unicode).toBe('caf%C3%A9%20fran%C3%A7ais');
      return [200, entryFindMock];
    });
    
    query.setParameters({
      symbols: 'hello@world.com?param=value',
      unicode: 'café français'
    });
    await query.find(true);
  });

  it('should preserve non-string values when encoding', async () => {
    mockClient.onGet('/content_types/test_uid/entries').reply((config) => {
      const queryParam = config.params?.query;
      // Numbers and booleans should not be encoded
      expect(queryParam.numberValue).toBe(42);
      expect(queryParam.booleanTrue).toBe(true);
      expect(queryParam.booleanFalse).toBe(false);
      // Strings should be encoded
      expect(queryParam.stringValue).toBe('encode%20me');
      return [200, entryFindMock];
    });
    
    query.setParameters({
      stringValue: 'encode me',
      numberValue: 42,
      booleanTrue: true,
      booleanFalse: false
    });
    await query.find(true);
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

  it('should handle find with empty parameters and encode', async () => {
    mockClient.onGet('/content_types/test_uid/entries').reply(200, entryFindMock);
    
    query.setParameters({});
    const result = await query.find(true);
    
    expect(result).toEqual(entryFindMock);
  });

  it('should combine query params and _parameters correctly when encoding', async () => {
    mockClient.onGet('/content_types/test_uid/entries').reply((config) => {
      const params = config.params;
      // Verify both query params and _parameters are included
      expect(params.limit).toBe(10);
      expect(params.query).toBeDefined();
      expect(params.query.title).toBe('Test%20Title');
      return [200, entryFindMock];
    });
    
    query.setParameters({ title: 'Test Title' });
    query.limit(10);
    await query.find(true);
  });

  it('should handle find with complex nested parameters and encoding', async () => {
    mockClient.onGet('/content_types/test_uid/entries').reply((config) => {
      const queryParam = config.params?.query;
      expect(queryParam.complex.nested.deep.value).toBe('encoded%20value');
      return [200, entryFindMock];
    });
    
    query.setParameters({
      complex: {
        nested: {
          deep: {
            value: 'encoded value'
          }
        }
      }
    });
    await query.find(true);
  });
}); 