import { AxiosInstance, httpClient } from '@contentstack/core';
import MockAdapter from 'axios-mock-adapter';
import { MOCK_CLIENT_OPTIONS } from '../utils/constant';
import { Query } from '../../src/lib/query';
import { QueryOperation, QueryOperator } from '../../src/lib/types';
import { entryFindMock } from '../utils/mocks';
import { Entries } from '../../src/lib/entries';
import { ErrorMessages } from '../../src/lib/error-messages';

// Mock @contentstack/core
jest.mock('@contentstack/core', () => ({
  ...jest.requireActual('@contentstack/core'),
  httpClient: jest.fn(),
}));

// Create HTTP client mock
const createHttpClientMock = () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  request: jest.fn(),
  defaults: {
    adapter: jest.fn(),
    headers: {},
    logHandler: jest.fn(),
  },
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
});

describe('Query Optimization - Comprehensive Test Suite', () => {
  let client: AxiosInstance;
  let mockClient: MockAdapter;
  let query: Query;

  beforeEach(() => {
    // Mock httpClient to return our mock
    (httpClient as jest.Mock).mockReturnValue(createHttpClientMock());
    client = httpClient(MOCK_CLIENT_OPTIONS);
    mockClient = new MockAdapter(client as any);
    query = new Query(client, {}, {}, '', 'blog_post');
  });

  afterEach(() => {
    mockClient.reset();
    jest.clearAllMocks();
  });

  describe('Complex Query Building', () => {
    it('should build complex nested queries with multiple operators', () => {
      const subQuery1 = new Query(client, {}, {}, '', 'author');
      subQuery1.where('name', QueryOperation.EQUALS, 'John Doe');
      subQuery1.where('age', QueryOperation.IS_GREATER_THAN, 25);

      const subQuery2 = new Query(client, {}, {}, '', 'category');
      subQuery2.containedIn('name', ['Technology', 'Science']);

      query.whereIn('author', subQuery1);
      query.whereIn('category', subQuery2);
      query.where('status', QueryOperation.EQUALS, 'published');

      expect(query._parameters).toHaveProperty('author');
      expect(query._parameters).toHaveProperty('category');
      expect(query._parameters).toHaveProperty('status');
      expect(query._parameters.author).toHaveProperty('$in_query');
      expect(query._parameters.category).toHaveProperty('$in_query');
    });

    it('should handle complex OR operations with multiple conditions', () => {
      const orQuery1 = new Query(client, {}, {}, '', 'blog_post');
      orQuery1.where('title', QueryOperation.MATCHES, 'Technology');

      const orQuery2 = new Query(client, {}, {}, '', 'blog_post');
      orQuery2.where('tags', QueryOperation.INCLUDES, ['AI', 'Machine Learning']);

      const orQuery3 = new Query(client, {}, {}, '', 'blog_post');
      orQuery3.where('author.name', QueryOperation.EQUALS, 'Expert Author');

      query.or(orQuery1, orQuery2, orQuery3);

      expect(query._parameters).toHaveProperty('$or');
      expect(query._parameters.$or).toHaveLength(3);
    });

    it('should handle complex AND operations with multiple conditions', () => {
      const andQuery1 = new Query(client, {}, {}, '', 'blog_post');
      andQuery1.where('publish_date', QueryOperation.IS_GREATER_THAN, '2024-01-01');

      const andQuery2 = new Query(client, {}, {}, '', 'blog_post');
      andQuery2.where('view_count', QueryOperation.IS_GREATER_THAN, 1000);

      const andQuery3 = new Query(client, {}, {}, '', 'blog_post');
      andQuery3.exists('featured_image');

      query.and(andQuery1, andQuery2, andQuery3);

      expect(query._parameters).toHaveProperty('$and');
      expect(query._parameters.$and).toHaveLength(3);
    });

    it('should build complex queries with mixed operators', () => {
      const subQuery = new Query(client, {}, {}, '', 'author');
      subQuery.where('verified', QueryOperation.EQUALS, true);

      const orQuery1 = new Query(client, {}, {}, '', 'blog_post');
      orQuery1.where('priority', QueryOperation.EQUALS, 'high');

      const orQuery2 = new Query(client, {}, {}, '', 'blog_post');
      orQuery2.where('featured', QueryOperation.EQUALS, true);

      query.whereIn('author', subQuery);
      query.or(orQuery1, orQuery2);
      query.where('status', QueryOperation.EQUALS, 'published');
      query.containedIn('category', ['tech', 'science']);

      expect(Object.keys(query._parameters)).toContain('author');
      expect(Object.keys(query._parameters)).toContain('$or');
      expect(Object.keys(query._parameters)).toContain('status');
      expect(Object.keys(query._parameters)).toContain('category');
    });

    it('should handle deeply nested reference queries', () => {
      const level3Query = new Query(client, {}, {}, '', 'department');
      level3Query.where('name', QueryOperation.EQUALS, 'Engineering');

      const level2Query = new Query(client, {}, {}, '', 'company');
      level2Query.whereIn('department', level3Query);

      const level1Query = new Query(client, {}, {}, '', 'author');
      level1Query.whereIn('company', level2Query);

      query.whereIn('author', level1Query);

      expect(query._parameters.author).toHaveProperty('$in_query');
      expect(query._parameters.author.$in_query).toHaveProperty('company');
    });

    it('should optimize query with multiple reference constraints', () => {
      const authorQuery = new Query(client, {}, {}, '', 'author');
      authorQuery.where('verified', QueryOperation.EQUALS, true);
      authorQuery.where('rating', QueryOperation.IS_GREATER_THAN, 4.5);

      const categoryQuery = new Query(client, {}, {}, '', 'category');
      categoryQuery.where('active', QueryOperation.EQUALS, true);
      categoryQuery.containedIn('type', ['premium', 'featured']);

      query.whereIn('author', authorQuery);
      query.whereIn('category', categoryQuery);
      query.where('publish_date', QueryOperation.IS_GREATER_THAN, '2024-01-01');

      expect(query._parameters.author.$in_query).toHaveProperty('verified');
      expect(query._parameters.author.$in_query).toHaveProperty('rating');
      expect(query._parameters.category.$in_query).toHaveProperty('active');
      expect(query._parameters.category.$in_query).toHaveProperty('type');
    });
  });

  describe('Parameter Validation', () => {
    it('should validate field UIDs for alphanumeric characters', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Valid field UIDs
      query.where('valid_field', QueryOperation.EQUALS, 'value');
      query.where('field123', QueryOperation.EQUALS, 'value');
      query.where('field_with_underscore', QueryOperation.EQUALS, 'value');
      query.where('field.with.dots', QueryOperation.EQUALS, 'value');
      query.where('field-with-dash', QueryOperation.EQUALS, 'value');

      // Invalid field UIDs
      query.where('invalid field', QueryOperation.EQUALS, 'value');
      query.where('field@symbol', QueryOperation.EQUALS, 'value');
      query.where('field#hash', QueryOperation.EQUALS, 'value');

      expect(consoleSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_FIELD_UID);
      expect(consoleSpy).toHaveBeenCalledTimes(3);

      consoleSpy.mockRestore();
    });

    it('should validate regex patterns for safety', () => {
      // Valid regex patterns
      expect(() => query.regex('title', '^[A-Za-z]+')).not.toThrow();
      expect(() => query.regex('title', '.*test.*')).not.toThrow();
      expect(() => query.regex('title', '^Demo')).not.toThrow();

      // Invalid regex patterns
      expect(() => query.regex('title', '[a-z')).toThrow(ErrorMessages.INVALID_REGEX_PATTERN);
      expect(() => query.regex('title', '*invalid')).toThrow(ErrorMessages.INVALID_REGEX_PATTERN);
    });

    it('should validate containedIn values for proper types', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Valid values
      query.containedIn('tags', ['tag1', 'tag2']);
      query.containedIn('numbers', [1, 2, 3]);
      query.containedIn('flags', [true, false]);

      // Invalid values
      query.containedIn('invalid', [{}, null, undefined] as any);
      query.containedIn('mixed_invalid', ['valid', {}, 'also_valid'] as any);

      expect(consoleSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_VALUE_ARRAY);
      expect(consoleSpy).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });

    it('should validate reference UIDs for whereIn operations', () => {
      const subQuery = new Query(client, {}, {}, '', 'author');
      subQuery.where('name', QueryOperation.EQUALS, 'John');

      // Valid reference UID
      expect(() => query.whereIn('valid_ref', subQuery)).not.toThrow();

      // Invalid reference UID
      expect(() => query.whereIn('invalid ref', subQuery)).toThrow(ErrorMessages.INVALID_REFERENCE_UID('invalid ref'));
    });

    it('should validate value types for comparison operations', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Valid values
      query.equalTo('title', 'string value');
      query.equalTo('count', 42);
      query.equalTo('is_published', true);
      query.lessThan('score', 100);
      query.greaterThan('rating', 3.5);

      // Invalid values
      query.equalTo('invalid', {} as any);
      query.equalTo('also_invalid', [] as any);
      query.lessThan('bad_value', {} as any);

      expect(consoleSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_VALUE_STRING_OR_NUMBER);
      expect(consoleSpy).toHaveBeenCalledTimes(3);

      consoleSpy.mockRestore();
    });

    it('should validate search key for typeahead', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Valid search key
      query.search('valid_search');
      expect(query._queryParams.typeahead).toBe('valid_search');

      // Invalid search key
      query.search('invalid search');
      expect(consoleSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_KEY);

      consoleSpy.mockRestore();
    });
  });

  describe('Query Parameter Optimization', () => {
    it('should optimize query parameters for minimal payload', () => {
      query.where('title', QueryOperation.EQUALS, 'Test');
      query.where('status', QueryOperation.EQUALS, 'published');
      query.containedIn('tags', ['tech', 'ai']);

      const params = query._parameters;
      
      // Should use direct assignment for EQUALS operations
      expect(params.title).toBe('Test');
      expect(params.status).toBe('published');
      
      // Should use proper operators for other operations
      expect(params.tags).toEqual({ $in: ['tech', 'ai'] });
    });

    it('should handle parameter merging for complex queries', () => {
      const baseQuery = new Query(client, { existing: 'value' }, {}, '', 'blog_post');
      
      baseQuery.where('new_field', QueryOperation.EQUALS, 'new_value');
      baseQuery.containedIn('categories', ['cat1', 'cat2']);

      expect(baseQuery._parameters.existing).toBe('value');
      expect(baseQuery._parameters.new_field).toBe('new_value');
      expect(baseQuery._parameters.categories).toEqual({ $in: ['cat1', 'cat2'] });
    });

    it('should optimize chained query operations', () => {
      const result = query
        .where('title', QueryOperation.EQUALS, 'Test')
        .containedIn('tags', ['tech'])
        .exists('featured_image')
        .greaterThan('view_count', 100);

      expect(result).toBe(query); // Should return same instance for chaining
      expect(Object.keys(query._parameters)).toHaveLength(4);
    });

    it('should handle query parameter encoding efficiently', () => {
      query.where('title', QueryOperation.MATCHES, 'test.*');
      query.containedIn('tags', ['tag with spaces', 'tag/with/slashes']);

      // Parameters should be stored in raw form for encoding later
      expect(query._parameters.title).toEqual({ $regex: 'test.*' });
      expect(query._parameters.tags).toEqual({ $in: ['tag with spaces', 'tag/with/slashes'] });
    });

    it('should optimize query params vs parameters separation', () => {
      query.where('title', QueryOperation.EQUALS, 'Test'); // Goes to _parameters
      query.param('include_count', 'true'); // Goes to _queryParams
      query.limit(10); // Goes to _queryParams

      expect(query._parameters).toHaveProperty('title');
      expect(query._queryParams).toHaveProperty('include_count');
      expect(query._queryParams).toHaveProperty('limit');
    });
  });

  describe('Performance Profiling', () => {
    it('should handle large query parameter sets efficiently', () => {
      const startTime = performance.now();

      // Build a large query with many parameters
      for (let i = 0; i < 100; i++) {
        query.where(`field_${i}`, QueryOperation.EQUALS, `value_${i}`);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(Object.keys(query._parameters)).toHaveLength(100);
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });

    it('should optimize memory usage for complex nested queries', () => {
      const memoryBefore = process.memoryUsage().heapUsed;

      // Create deeply nested query structure
      for (let i = 0; i < 10; i++) {
        const subQuery = new Query(client, {}, {}, '', `content_type_${i}`);
        for (let j = 0; j < 10; j++) {
          subQuery.where(`field_${j}`, QueryOperation.EQUALS, `value_${j}`);
        }
        query.whereIn(`reference_${i}`, subQuery);
      }

      const memoryAfter = process.memoryUsage().heapUsed;
      const memoryDiff = memoryAfter - memoryBefore;

      expect(Object.keys(query._parameters)).toHaveLength(10);
      expect(memoryDiff).toBeLessThan(10 * 1024 * 1024); // Should use less than 10MB
    });

    it('should benchmark query building performance', () => {
      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const testQuery = new Query(client, {}, {}, '', 'test');
        testQuery.where('field1', QueryOperation.EQUALS, 'value1');
        testQuery.containedIn('field2', ['val1', 'val2']);
        testQuery.exists('field3');
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;

      expect(avgTime).toBeLessThan(1); // Should average less than 1ms per query
    });

    it('should handle concurrent query operations efficiently', async () => {
      const concurrentQueries = Array.from({ length: 50 }, (_, i) => {
        const testQuery = new Query(client, {}, {}, '', `type_${i}`);
        testQuery.where('field', QueryOperation.EQUALS, `value_${i}`);
        return testQuery;
      });

      const startTime = performance.now();
      
      // Process all queries concurrently
      const results = await Promise.all(
        concurrentQueries.map(async (q) => {
          // Simulate async operation
          await new Promise(resolve => setTimeout(resolve, 1));
          return q.getQuery();
        })
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(50);
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    it('should optimize query serialization performance', () => {
      // Build complex query
      const subQuery = new Query(client, {}, {}, '', 'author');
      subQuery.where('verified', QueryOperation.EQUALS, true);
      subQuery.containedIn('skills', ['javascript', 'typescript', 'react']);

      query.whereIn('author', subQuery);
      query.where('status', QueryOperation.EQUALS, 'published');
      query.containedIn('tags', ['tech', 'programming', 'tutorial']);

      const startTime = performance.now();
      
      // Serialize query multiple times
      for (let i = 0; i < 100; i++) {
        const serialized = JSON.stringify(query.getQuery());
        expect(serialized).toContain('author');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50); // Should complete within 50ms
    });
  });

  describe('Query Result Caching Optimization', () => {
    it('should generate consistent cache keys for identical queries', () => {
      const query1 = new Query(client, {}, {}, '', 'blog_post');
      query1.where('title', QueryOperation.EQUALS, 'Test');
      query1.containedIn('tags', ['tech', 'ai']);

      const query2 = new Query(client, {}, {}, '', 'blog_post');
      query2.where('title', QueryOperation.EQUALS, 'Test');
      query2.containedIn('tags', ['tech', 'ai']);

      const params1 = JSON.stringify(query1.getQuery());
      const params2 = JSON.stringify(query2.getQuery());

      expect(params1).toBe(params2);
    });

    it('should handle cache key generation for complex queries', () => {
      const subQuery = new Query(client, {}, {}, '', 'author');
      subQuery.where('verified', QueryOperation.EQUALS, true);

      query.whereIn('author', subQuery);
      query.where('status', QueryOperation.EQUALS, 'published');

      const cacheKey = JSON.stringify(query.getQuery());
      
      expect(cacheKey).toContain('author');
      expect(cacheKey).toContain('$in_query');
      expect(cacheKey).toContain('verified');
      expect(cacheKey).toContain('status');
    });

    it('should optimize cache invalidation patterns', () => {
      // Test that different query variations produce different cache keys
      const baseQuery = new Query(client, {}, {}, '', 'blog_post');
      baseQuery.where('status', QueryOperation.EQUALS, 'published');

      const query1 = new Query(client, {}, {}, '', 'blog_post');
      query1.where('status', QueryOperation.EQUALS, 'published');
      query1.limit(10);

      const query2 = new Query(client, {}, {}, '', 'blog_post');
      query2.where('status', QueryOperation.EQUALS, 'published');
      query2.limit(20);

      const key1 = JSON.stringify({ params: query1.getQuery(), queryParams: query1._queryParams });
      const key2 = JSON.stringify({ params: query2.getQuery(), queryParams: query2._queryParams });

      expect(key1).not.toBe(key2);
    });

    it('should handle cache efficiency for reference queries', () => {
      const authorQuery = new Query(client, {}, {}, '', 'author');
      authorQuery.where('department', QueryOperation.EQUALS, 'Engineering');

      const blogQuery = new Query(client, {}, {}, '', 'blog_post');
      blogQuery.whereIn('author', authorQuery);

      // Should be able to cache both the reference query and main query
      const mainCacheKey = JSON.stringify(blogQuery.getQuery());
      const refCacheKey = JSON.stringify(authorQuery.getQuery());

      expect(mainCacheKey).toContain('$in_query');
      expect(refCacheKey).toContain('department');
    });
  });

  describe('Query Optimization Strategies', () => {
    it('should optimize query structure for database efficiency', () => {
      // Test that equals operations are optimized
      query.where('status', QueryOperation.EQUALS, 'published');
      query.where('featured', QueryOperation.EQUALS, true);

      // Direct assignment should be used for equals
      expect(query._parameters.status).toBe('published');
      expect(query._parameters.featured).toBe(true);
    });

    it('should optimize field selection for minimal data transfer', () => {
      const entries = new Entries(client, 'blog_post');
      const optimizedQuery = entries.only(['title', 'url', 'publish_date']);

      expect(optimizedQuery._queryParams['only[BASE][0]']).toBe('title');
      expect(optimizedQuery._queryParams['only[BASE][1]']).toBe('url');
      expect(optimizedQuery._queryParams['only[BASE][2]']).toBe('publish_date');
    });

    it('should handle query complexity scoring', () => {
      let complexityScore = 0;

      // Simple query - low complexity
      const simpleQuery = new Query(client, {}, {}, '', 'blog_post');
      simpleQuery.where('status', QueryOperation.EQUALS, 'published');
      complexityScore += Object.keys(simpleQuery._parameters).length;

      // Complex query - high complexity
      const complexQuery = new Query(client, {}, {}, '', 'blog_post');
      const subQuery = new Query(client, {}, {}, '', 'author');
      subQuery.where('verified', QueryOperation.EQUALS, true);
      complexQuery.whereIn('author', subQuery);
      complexQuery.containedIn('tags', ['tech', 'ai']);
      complexQuery.exists('featured_image');
      complexityScore += Object.keys(complexQuery._parameters).length * 2; // Reference queries are more complex

      expect(complexityScore).toBeGreaterThan(3);
    });

    it('should optimize query execution order', () => {
      // Test that most selective filters are applied first conceptually
      query.where('status', QueryOperation.EQUALS, 'published'); // Very selective
      query.where('created_at', QueryOperation.IS_GREATER_THAN, '2024-01-01'); // Moderately selective
      query.exists('content'); // Less selective

      const params = query._parameters;
      
      // All parameters should be present
      expect(params).toHaveProperty('status');
      expect(params).toHaveProperty('created_at');
      expect(params).toHaveProperty('content');
    });

    it('should handle query result pagination optimization', () => {
      const entries = new Entries(client, 'blog_post');
      entries.limit(50);
      entries.skip(100);

      expect(entries._queryParams.limit).toBe(50);
      expect(entries._queryParams.skip).toBe(100);
    });
  });

  describe('Advanced Query Patterns', () => {
    it('should handle geographic and spatial queries', () => {
      // Test location-based queries
      query.where('location.coordinates', QueryOperation.MATCHES, '40.7128,-74.0060');
      query.where('radius', QueryOperation.IS_LESS_THAN, 10);

      expect(query._parameters['location.coordinates']).toHaveProperty('$regex');
      expect(query._parameters.radius).toHaveProperty('$lt');
    });

    it('should optimize date range queries', () => {
      query.where('publish_date', QueryOperation.IS_GREATER_THAN, '2024-01-01');
      query.where('publish_date', QueryOperation.IS_LESS_THAN, '2024-12-31');

      // Should handle multiple conditions on same field
      expect(query._parameters.publish_date).toHaveProperty('$lt');
      // Note: This will overwrite the previous condition in current implementation
      // In a real optimization, this would be combined into a single range query
    });

    it('should handle full-text search optimization', () => {
      query.search('artificial_intelligence');
      
      expect(query._queryParams.typeahead).toBe('artificial_intelligence');
    });

    it('should optimize taxonomy and categorization queries', () => {
      query.containedIn('categories.name', ['Technology', 'Science']);
      query.containedIn('tags', ['AI', 'ML', 'Deep Learning']);

      expect(query._parameters['categories.name']).toEqual({ $in: ['Technology', 'Science'] });
      expect(query._parameters.tags).toEqual({ $in: ['AI', 'ML', 'Deep Learning'] });
    });

    it('should handle multi-language content optimization', () => {
      const entries = new Entries(client, 'blog_post');
      entries.locale('en-us');
      entries.includeFallback();

      expect(entries._queryParams.locale).toBe('en-us');
      expect(entries._queryParams.include_fallback).toBe('true');
    });

    it('should optimize content versioning queries', () => {
      query.where('_version', QueryOperation.IS_GREATER_THAN, 1);
      query.where('publish_details.environment', QueryOperation.EQUALS, 'production');

      expect(query._parameters._version).toHaveProperty('$gt');
      expect(query._parameters['publish_details.environment']).toBe('production');
    });
  });
}); 