import { AxiosInstance, httpClient } from '@contentstack/core';
import MockAdapter from 'axios-mock-adapter';
import { BaseQuery, ContentTypeQuery } from '../../src/query';
import { MOCK_CLIENT_OPTIONS } from '../utils/constant';
import { contentTypeQueryFindResponseDataMock } from '../utils/mocks';

describe('ContentTypeQuery class', () => {
  let contentTypeQuery: ContentTypeQuery;
  let client: AxiosInstance;
  let mockClient: MockAdapter;

  beforeAll(() => {
    client = httpClient(MOCK_CLIENT_OPTIONS);
    mockClient = new MockAdapter(client as any);
  });

  beforeEach(() => {
    mockClient.reset();
    contentTypeQuery = new ContentTypeQuery(client);
  });

  it('should extend BaseQuery', () => {
    expect(contentTypeQuery).toBeInstanceOf(BaseQuery);
    expect(contentTypeQuery).toBeInstanceOf(ContentTypeQuery);
  });

  it('should add "include_global_field_schema" in queryParams when includeGlobalFieldSchema method is called ', () => {
    const returnedValue = contentTypeQuery.includeGlobalFieldSchema();

    expect(returnedValue).toBeInstanceOf(ContentTypeQuery);
    expect(contentTypeQuery._queryParams.include_global_field_schema).toBe('true');
  });

  it('should return response data when successful', async () => {
    mockClient.onGet('/content_types').reply(200, contentTypeQueryFindResponseDataMock);
    const response = await contentTypeQuery.find();
    expect(response).toEqual(contentTypeQueryFindResponseDataMock);
  });

  it('should pass skip and limit from paginate() to the request', async () => {
    mockClient.onGet('/content_types').reply((config) => {
      expect(config.params).toMatchObject({ skip: 10, limit: 10 });
      return [200, contentTypeQueryFindResponseDataMock];
    });
    await contentTypeQuery.paginate({ skip: 10, limit: 10 }).find();
  });

  it('should use default skip 0 and limit 10 when paginate() is called with no argument', async () => {
    mockClient.onGet('/content_types').reply((config) => {
      expect(config.params).toMatchObject({ skip: 0, limit: 10 });
      return [200, contentTypeQueryFindResponseDataMock];
    });
    await contentTypeQuery.paginate().find();
  });

  it('should pass only skip from skip() to the request', async () => {
    mockClient.onGet('/content_types').reply((config) => {
      expect(config.params).toMatchObject({ skip: 25 });
      return [200, contentTypeQueryFindResponseDataMock];
    });
    await contentTypeQuery.skip(25).find();
  });

  it('should pass only limit from limit() to the request', async () => {
    mockClient.onGet('/content_types').reply((config) => {
      expect(config.params).toMatchObject({ limit: 15 });
      return [200, contentTypeQueryFindResponseDataMock];
    });
    await contentTypeQuery.limit(15).find();
  });

  it('should combine skip() and limit() on the request', async () => {
    mockClient.onGet('/content_types').reply((config) => {
      expect(config.params).toMatchObject({ skip: 40, limit: 20 });
      return [200, contentTypeQueryFindResponseDataMock];
    });
    await contentTypeQuery.skip(40).limit(20).find();
  });

  it('should merge includeGlobalFieldSchema with paginate params on the request', async () => {
    mockClient.onGet('/content_types').reply((config) => {
      expect(config.params).toMatchObject({
        include_global_field_schema: 'true',
        skip: 5,
        limit: 5,
      });
      return [200, contentTypeQueryFindResponseDataMock];
    });
    await contentTypeQuery.includeGlobalFieldSchema().paginate({ skip: 5, limit: 5 }).find();
  });

  it('should merge addParams into the request', async () => {
    mockClient.onGet('/content_types').reply((config) => {
      expect(config.params).toMatchObject({
        include_branch: 'true',
        locale: 'en-us',
      });
      return [200, contentTypeQueryFindResponseDataMock];
    });
    await contentTypeQuery.addParams({ include_branch: 'true', locale: 'en-us' }).find();
  });

  it('should add a single param via param()', async () => {
    mockClient.onGet('/content_types').reply((config) => {
      expect(config.params).toMatchObject({ custom_key: 'custom_value' });
      return [200, contentTypeQueryFindResponseDataMock];
    });
    await contentTypeQuery.param('custom_key', 'custom_value').find();
  });

  it('should remove a query param via removeParam()', async () => {
    mockClient.onGet('/content_types').reply((config) => {
      expect(config.params).not.toHaveProperty('to_remove');
      expect(config.params).toMatchObject({ keep: 'yes' });
      return [200, contentTypeQueryFindResponseDataMock];
    });
    await contentTypeQuery
      .addParams({ to_remove: 'gone', keep: 'yes' })
      .removeParam('to_remove')
      .find();
  });

  it('should set include_count via includeCount()', async () => {
    mockClient.onGet('/content_types').reply((config) => {
      expect(config.params).toMatchObject({ include_count: 'true' });
      return [200, contentTypeQueryFindResponseDataMock];
    });
    await contentTypeQuery.includeCount().find();
  });

  it('should set asc via orderByAscending()', async () => {
    mockClient.onGet('/content_types').reply((config) => {
      expect(config.params).toMatchObject({ asc: 'title' });
      return [200, contentTypeQueryFindResponseDataMock];
    });
    await contentTypeQuery.orderByAscending('title').find();
  });

  it('should set desc via orderByDescending()', async () => {
    mockClient.onGet('/content_types').reply((config) => {
      expect(config.params).toMatchObject({ desc: 'created_at' });
      return [200, contentTypeQueryFindResponseDataMock];
    });
    await contentTypeQuery.orderByDescending('created_at').find();
  });

  it('should advance skip by limit when next() is called after paginate()', async () => {
    mockClient.onGet('/content_types').reply((config) => {
      expect(config.params).toMatchObject({ skip: 10, limit: 10 });
      return [200, contentTypeQueryFindResponseDataMock];
    });
    await contentTypeQuery.paginate({ skip: 0, limit: 10 }).next().find();
  });

  it('should decrease skip by limit when previous() is called after paginate()', async () => {
    mockClient.onGet('/content_types').reply((config) => {
      expect(config.params).toMatchObject({ skip: 0, limit: 10 });
      return [200, contentTypeQueryFindResponseDataMock];
    });
    await contentTypeQuery.paginate({ skip: 10, limit: 10 }).previous().find();
  });

  it('should clamp skip to 0 when previous() would go negative', async () => {
    mockClient.onGet('/content_types').reply((config) => {
      expect(config.params).toMatchObject({ skip: 0, limit: 10 });
      return [200, contentTypeQueryFindResponseDataMock];
    });
    await contentTypeQuery.paginate({ skip: 5, limit: 10 }).previous().find();
  });

  it('should return data when find(true) is used with no entry query body', async () => {
    mockClient.onGet('/content_types').reply(200, contentTypeQueryFindResponseDataMock);
    const response = await contentTypeQuery.paginate({ skip: 0, limit: 2 }).find(true);
    expect(response).toEqual(contentTypeQueryFindResponseDataMock);
  });
});
