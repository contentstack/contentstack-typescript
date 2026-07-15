import { TaxonomyQuery } from '../../src/query/taxonomy-query';
import { Taxonomy } from '../../src/taxonomy';
import { AxiosInstance, httpClient } from '@contentstack/core';
import MockAdapter from 'axios-mock-adapter';
import { taxonomyFindResponseDataMock, taxonomyLocalizedFetchMock } from '../utils/mocks';
import { MOCK_CLIENT_OPTIONS } from '../utils/constant';
import { Term } from '../../src/taxonomy/term';
import { TermQuery } from '../../src/query/term-query';

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

  it('should send include and arbitrary params on fetch() when chained', async () => {
    mockClient.onGet('/taxonomies/taxonomy_testing').reply((config) => {
      expect(config.params).toEqual(expect.objectContaining({ include_fallback: 'true', include_branch: 'true', locale: 'fr-fr' }));
      return [200, taxonomyFindResponseDataMock.taxonomies[0]];
    });

    await taxonomy.includeFallback().includeBranch().param('locale', 'fr-fr').fetch();
  });

  it('should return localized taxonomy when fetch is called with locale', async () => {
    mockClient.onGet('/taxonomies/taxonomy_testing').reply(200, taxonomyLocalizedFetchMock);
    const response = await taxonomy.fetch('hi-in');
    expect(response).toEqual(taxonomyLocalizedFetchMock.taxonomy);
  });
});
