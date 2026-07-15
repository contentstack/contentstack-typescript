import { AxiosInstance, httpClient } from '@contentstack/core';
import MockAdapter from 'axios-mock-adapter';
import { termQueryFindResponseDataMock, termLocalesResponseDataMock, termAncestorsResponseDataMock, termDescendantsResponseDataMock, termLocalizedFetchMock } from '../utils/mocks';
import { MOCK_CLIENT_OPTIONS } from '../utils/constant';
import { Term } from '../../src/taxonomy/term';
import { Taxonomy } from '../../src/taxonomy';

describe('Term class', () => {
  let term: Term;
  let client: AxiosInstance;
  let mockClient: MockAdapter;

  beforeAll(() => {
    client = httpClient(MOCK_CLIENT_OPTIONS);
    mockClient = new MockAdapter(client as any);
  });

  beforeEach(() => {
    term = new Term(client, 'taxonomy_testing', 'term1');
  });

  it('should fetch the term by uid response when fetch method is called', async () => {
    mockClient.onGet('/taxonomies/taxonomy_testing/terms/term1').reply(200, termQueryFindResponseDataMock.terms[0]);

    const response = await term.fetch();
    expect(response).toEqual(termQueryFindResponseDataMock.terms[0]);
  });

  it('should fetch locales for a term when locales() is called', async () => {
    mockClient.onGet('/taxonomies/taxonomy_testing/terms/term1/locales').reply(200, termLocalesResponseDataMock.terms);

    const response = await term.locales();
    expect(response).toEqual(termLocalesResponseDataMock.terms);
  });

  it('should fetch ancestors for a term when ancestors() is called', async () => {
    mockClient.onGet('/taxonomies/taxonomy_testing/terms/term1/ancestors').reply(200, termAncestorsResponseDataMock);

    const response = await term.ancestors();
    expect(response).toEqual(termAncestorsResponseDataMock);
  });

  it('should fetch descendants for a term when descendants() is called', async () => {
    mockClient.onGet('/taxonomies/taxonomy_testing/terms/term1/descendants').reply(200, termDescendantsResponseDataMock);

    const response = await term.descendants();
    expect(response).toEqual(termDescendantsResponseDataMock);
  });

  it('should send depth param on descendants() when depth() is chained', async () => {
    mockClient
      .onGet('/taxonomies/taxonomy_testing/terms/term1/descendants')
      .reply((config) => {
        expect(config.params).toEqual(expect.objectContaining({ depth: 2 }));
        return [200, termDescendantsResponseDataMock];
      });

    await term.depth(2).descendants();
  });

  it('should send include_fallback and include_branch params on fetch()', async () => {
    mockClient.onGet('/taxonomies/taxonomy_testing/terms/term1').reply((config) => {
      expect(config.params).toEqual(expect.objectContaining({ include_fallback: 'true', include_branch: 'true' }));
      return [200, termQueryFindResponseDataMock.terms[0]];
    });

    await term.includeFallback().includeBranch().fetch();
  });

  it('should send arbitrary params added via param() and addParams() on ancestors()', async () => {
    mockClient.onGet('/taxonomies/taxonomy_testing/terms/term1/ancestors').reply((config) => {
      expect(config.params).toEqual(expect.objectContaining({ depth: 1, locale: 'fr-fr' }));
      return [200, termAncestorsResponseDataMock];
    });

    await term.param('depth', 1).addParams({ locale: 'fr-fr' }).ancestors();
  });

  it('should fetch localized term when fetch is called with locale', async () => {
    mockClient.onGet('/taxonomies/taxonomy_testing/terms/term1').reply(200, termLocalizedFetchMock);

    const response = await term.fetch('hi-in');
    expect(response).toEqual(termLocalizedFetchMock.term);
  });
});
