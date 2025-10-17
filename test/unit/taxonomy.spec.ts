import { TaxonomyQuery } from '../../src/lib/taxonomy-query';
import { Taxonomy } from '../../src/lib/taxonomy';
import { AxiosInstance, httpClient } from '@contentstack/core';
import MockAdapter from 'axios-mock-adapter';
import { taxonomyFindResponseDataMock } from '../utils/mocks';
import { MOCK_CLIENT_OPTIONS } from '../utils/constant';

describe('ta class', () => {
  let taxonomies: TaxonomyQuery;
  let taxonomy: Taxonomy;
  let client: AxiosInstance;
  let mockClient: MockAdapter;

  beforeAll(() => {
    client = httpClient(MOCK_CLIENT_OPTIONS);
    mockClient = new MockAdapter(client as any);
  });

  beforeEach(() => {
    taxonomies = new TaxonomyQuery(client);
    taxonomy = new Taxonomy(client, 'taxonomy_testing');
  });

  it('should return all taxonomies in the response data when successful', async () => {
    mockClient.onGet('/taxonomy-manager').reply(200, taxonomyFindResponseDataMock); //TODO: change to /taxonomies
    const response = await taxonomies.find();
    expect(response).toEqual(taxonomyFindResponseDataMock);
  });

  it('should return single taxonomy in the response data when successful', async () => {
    mockClient.onGet('/taxonomy-manager/taxonomy_testing').reply(200, taxonomyFindResponseDataMock.taxonomies[0]); //TODO: change to /taxonomies/taxonomyUid
    const response = await taxonomy.fetch();
    expect(response).toEqual(taxonomyFindResponseDataMock.taxonomies[0]); //TODO: change to taxonomyFindResponseDataMock
  });
});
