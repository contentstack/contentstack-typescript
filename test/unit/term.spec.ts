import { AxiosInstance, httpClient } from '@contentstack/core';
import MockAdapter from 'axios-mock-adapter';
import { TermQueryFindResponseDataMock } from '../utils/mocks';
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
    mockClient.onGet('/taxonomy-manager/taxonomy_testing/terms/term1').reply(200, TermQueryFindResponseDataMock.terms[0]); //TODO: change to /taxonomies

    const response = await term.fetch();
    expect(response).toEqual(TermQueryFindResponseDataMock.terms[0]);
  });
});
