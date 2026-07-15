import { TermQuery } from '../../src/query/term-query';
import { AxiosInstance, httpClient } from '@contentstack/core';
import MockAdapter from 'axios-mock-adapter';
import { termQueryFindResponseDataMock, termQueryLocalizedFindMock } from '../utils/mocks';
import { MOCK_CLIENT_OPTIONS } from '../utils/constant';

describe('TermQuery class', () => {
  let termQuery: TermQuery;
  let client: AxiosInstance;
  let mockClient: MockAdapter;

  beforeAll(() => {
    client = httpClient(MOCK_CLIENT_OPTIONS);
    mockClient = new MockAdapter(client as any);
  });

  beforeEach(() => {
    termQuery = new TermQuery(client, 'taxonomy_testing');
  });

  it('should return response data when successful', async () => {
    mockClient.onGet('/taxonomies/taxonomy_testing/terms').reply(200, termQueryFindResponseDataMock);
    const response = await termQuery.find();
    expect(response).toEqual(termQueryFindResponseDataMock);
  });

  it('should send pagination and include params when chained on find()', async () => {
    mockClient.onGet('/taxonomies/taxonomy_testing/terms').reply((config) => {
      expect(config.params).toEqual(expect.objectContaining({
        depth: 2,
        skip: 10,
        limit: 5,
        include_count: 'true',
        include_fallback: 'true',
        include_branch: 'true',
      }));
      return [200, termQueryFindResponseDataMock];
    });

    await termQuery
      .depth(2)
      .skip(10)
      .limit(5)
      .includeCount()
      .includeFallback()
      .includeBranch()
      .find();
  });

  it('should send arbitrary params added via param() and addParams() on find()', async () => {
    mockClient.onGet('/taxonomies/taxonomy_testing/terms').reply((config) => {
      expect(config.params).toEqual(expect.objectContaining({ locale: 'fr-fr', order: 1 }));
      return [200, termQueryFindResponseDataMock];
    });

    await termQuery.param('locale', 'fr-fr').addParams({ order: 1 }).find();
  });

  it('should set locale query param when locale() is called', async () => {
    mockClient.onGet('/taxonomies/taxonomy_testing/terms').reply(200, termQueryLocalizedFindMock);
    const response = await termQuery.locale('hi-in').find();
    expect(termQuery._queryParams.locale).toBe('hi-in');
    expect(response).toEqual(termQueryLocalizedFindMock);
  });

  it('should set include_fallback query param when includeFallback() is called', async () => {
    mockClient.onGet('/taxonomies/taxonomy_testing/terms').reply(200, termQueryFindResponseDataMock);
    const response = await termQuery.includeFallback().find();
    expect(termQuery._queryParams.include_fallback).toBe('true');
    expect(response).toEqual(termQueryFindResponseDataMock);
  });

  it('should set both locale and include_fallback when chained', async () => {
    mockClient.onGet('/taxonomies/taxonomy_testing/terms').reply(200, termQueryLocalizedFindMock);
    const response = await termQuery.locale('hi-in').includeFallback().find();
    expect(termQuery._queryParams.locale).toBe('hi-in');
    expect(termQuery._queryParams.include_fallback).toBe('true');
    expect(response).toEqual(termQueryLocalizedFindMock);
  });
});
