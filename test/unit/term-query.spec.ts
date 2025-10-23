import { TermQuery } from '../../src/lib/term-query';
import { AxiosInstance, httpClient } from '@contentstack/core';
import MockAdapter from 'axios-mock-adapter';
import { TermQueryFindResponseDataMock } from '../utils/mocks';
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
    mockClient.onGet('/taxonomy-manager/taxonomy_testing/terms').reply(200, TermQueryFindResponseDataMock);
    const response = await termQuery.find();
    expect(response).toEqual(TermQueryFindResponseDataMock);
  });
});
