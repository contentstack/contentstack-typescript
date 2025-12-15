import { TaxonomyQuery } from '../../src/lib/taxonomy-query';
import { Taxonomy } from '../../src/lib/taxonomy';
import { AxiosInstance, httpClient } from '@contentstack/core';
import MockAdapter from 'axios-mock-adapter';
import { taxonomyFindResponseDataMock } from '../utils/mocks';
import { MOCK_CLIENT_OPTIONS } from '../utils/constant';
import { Term } from '../../src/lib/term';
import { TermQuery } from '../../src/lib/term-query';

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

  it('should give term instance when term method is called with termUid', () => {
    const query = taxonomy.term('termUid');
    expect(query).toBeInstanceOf(Term);
  });

  it('should give term query instance when term method is called without termUid', () => {
    const query = taxonomy.term()
    expect(query).toBeInstanceOf(TermQuery);
  });

  it('should return all taxonomies in the response data when successful', async () => {
    mockClient.onGet('/taxonomies').reply(200, taxonomyFindResponseDataMock);
    const response = await taxonomies.find();
    expect(response).toEqual(taxonomyFindResponseDataMock);
  });

  it('should return single taxonomy in the response data when successful', async () => {
    mockClient.onGet('/taxonomies/taxonomy_testing').reply(200, taxonomyFindResponseDataMock.taxonomies[0]);
    const response = await taxonomy.fetch();
    expect(response).toEqual(taxonomyFindResponseDataMock.taxonomies[0]);
  });
});
