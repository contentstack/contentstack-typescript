import { TaxonomyQuery } from '../../src/lib/taxonomy-query';
import { AxiosInstance, httpClient } from '@contentstack/core';
import MockAdapter from 'axios-mock-adapter';
import { taxonomyFindResponseDataMock } from '../utils/mocks';
import { MOCK_CLIENT_OPTIONS } from '../utils/constant';

describe('ta class', () => {
  let taxonomy: TaxonomyQuery;
  let client: AxiosInstance;
  let mockClient: MockAdapter;

  beforeAll(() => {
    client = httpClient(MOCK_CLIENT_OPTIONS);
    mockClient = new MockAdapter(client as any);
  });

  beforeEach(() => {
    taxonomy = new TaxonomyQuery(client);
  });

  it('should return response data when successful', async () => {
    mockClient.onGet('/taxonomy-manager').reply(200, taxonomyFindResponseDataMock); //TODO: change to /taxonomies
    const response = await taxonomy.find();
    expect(response).toEqual(taxonomyFindResponseDataMock);
  });
});
