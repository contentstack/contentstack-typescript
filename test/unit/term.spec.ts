import { AxiosInstance, httpClient } from '@contentstack/core';
import MockAdapter from 'axios-mock-adapter';
import { termQueryFindResponseDataMock, termLocalesResponseDataMock, termAncestorsResponseDataMock, termDescendantsResponseDataMock } from '../utils/mocks';
import { MOCK_CLIENT_OPTIONS } from '../utils/constant';
import { Term } from '../../src/lib/term';
import { Taxonomy } from '../../src/lib/taxonomy';

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
    mockClient.onGet('/taxonomy-manager/taxonomy_testing/terms/term1').reply(200, termQueryFindResponseDataMock.terms[0]); //TODO: change to /taxonomies

    const response = await term.fetch();
    expect(response).toEqual(termQueryFindResponseDataMock.terms[0]);
  });

  it('should fetch locales for a term when locales() is called', async () => {
    mockClient.onGet('/taxonomy-manager/taxonomy_testing/terms/term1/locales').reply(200, termLocalesResponseDataMock.terms); //TODO: change to /taxonomies

    const response = await term.locales();
    expect(response).toEqual(termLocalesResponseDataMock.terms);
  });

  it('should fetch ancestors for a term when ancestors() is called', async () => {
    mockClient.onGet('/taxonomy-manager/taxonomy_testing/terms/term1/ancestors').reply(200, termAncestorsResponseDataMock);

    const response = await term.ancestors();
    expect(response).toEqual(termAncestorsResponseDataMock);
  });

  it('should fetch descendants for a term when descendants() is called', async () => {
    mockClient.onGet('/taxonomy-manager/taxonomy_testing/terms/term1/descendants').reply(200, termDescendantsResponseDataMock);

    const response = await term.descendants();
    expect(response).toEqual(termDescendantsResponseDataMock);
  });
});
