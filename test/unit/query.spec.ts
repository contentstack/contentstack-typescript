import { httpClient, AxiosInstance } from '@contentstack/core';
import MockAdapter from 'axios-mock-adapter';
import { HOST_URL } from '../utils/constant';
import { Query } from '../../src/lib/query';
import { QueryOperation, QueryOperator } from '../../src/lib/types';
import { entryFindMock } from '../utils/mocks';
import { Entries } from '../../src/lib/entries';

describe('Query class', () => {
  let client: AxiosInstance;
  let mockClient: MockAdapter;
  let query: Query;

  beforeAll(() => {
    client = httpClient({ defaultHostname: HOST_URL });
    mockClient = new MockAdapter(client as any);
  });

  beforeEach(() => {
    query = getQueryObject(client, 'contentTypeUid');
  });

  it('should set a parameter correctly', () => {
    const _query = getQueryObject(client, 'contentTypeUid', { key1: 'value1' })
    expect(_query._parameters).toEqual({ key1: 'value1' });
  });

  it('should add an equality parameter to _parameters when queryOperation is EQUALS', () => {
    const fieldUid = 'foo';
    const fields = 'bar';
    query.where(fieldUid, QueryOperation.EQUALS, fields);
    expect(query._parameters[fieldUid]).toEqual(fields);
  });

  it('should add a parameter with the correct queryOperation to _parameters when queryOperation is not EQUALS', () => {
    const fieldUid = 'baz';
    const fields = ['qux', 'quux'];
    const queryOperation = QueryOperation.INCLUDES;
    query.where(fieldUid, queryOperation, fields);
    expect(query._parameters[fieldUid]).toEqual({ [queryOperation]: fields });
  });

  it('should allow chaining of where method calls', () => {
    const fieldUid1 = 'field1';
    const fields1 = ['value1', 'value2'];
    const fieldUid2 = 'field2';
    const fields2 = 'value3';
    const queryOperation1 = QueryOperation.INCLUDES;
    const queryOperation2 = QueryOperation.EQUALS;
    query.where(fieldUid1, queryOperation1, fields1).where(fieldUid2, queryOperation2, fields2);
    expect(query._parameters).toEqual({
      [fieldUid1]: { [queryOperation1]: fields1 },
      [fieldUid2]: fields2,
    });
  });

  it('should add a where-in filter to the query parameters', () => {
    const subQuery = getQueryObject(client, 'your-referenced-content-type-uid');
    subQuery.where('your-field-uid', QueryOperation.EQUALS, 'your-field-value');
    query.whereIn('your-reference-field-uid', subQuery);
    // eslint-disable-next-line prettier/prettier, @typescript-eslint/naming-convention
    expect(query._parameters['your-reference-field-uid']).toEqual({ '$in_query': subQuery._parameters });
  });

  it('should add a where-not-in filter to the query parameters', () => {
    const subQuery = getQueryObject(client, 'your-referenced-content-type-uid');
    subQuery.where('your-field-uid', QueryOperation.EQUALS, 'your-field-value');
    query.whereNotIn('your-reference-field-uid', subQuery);
    // eslint-disable-next-line prettier/prettier, @typescript-eslint/naming-convention
    expect(query._parameters['your-reference-field-uid']).toEqual({ '$nin_query': subQuery._parameters });
  });

  it('should add a query operator to the query parameters', () => {
    const subQuery1 = getQueryObject(client, 'your-content-type-uid-1');
    subQuery1.where('your-field-uid', QueryOperation.EQUALS, 'your-field-value-1');
    const subQuery2 = getQueryObject(client, 'your-content-type-uid-2');
    subQuery2.where('your-field-uid', QueryOperation.EQUALS, 'your-field-value-2');
    query.queryOperator(QueryOperator.OR, subQuery1, subQuery2);

    const mainQuery2 = getQueryObject(client, 'contentTypeUid2');
    mainQuery2.queryOperator(QueryOperator.AND, subQuery1, subQuery2);
    expect(query._parameters).toHaveProperty('$or', [subQuery1._parameters, subQuery2._parameters]);
    expect(mainQuery2._parameters).toHaveProperty('$and', [subQuery1._parameters, subQuery2._parameters]);
  });

  it('should result in error when regex method is called with invalid regex', async () => {
    const regexQuery = getQueryObject(client, 'your-referenced-content-type-uid');
    expect(() => regexQuery.regex("fieldUid", "[a-z")).toThrow("Invalid regexPattern: Must be a valid regular expression");
  });

  it('should add a regex parameter to _parameters when regex method is called with valid regex', () => {
    query.regex('fieldUid', '^ABCXYZ123');
    expect(query._parameters['fieldUid']).toEqual({ $regex: '^ABCXYZ123' });
  });

  it('should add a containedIn parameter to _parameters', () => {
    query.containedIn('fieldUid', ['value1', 'value2']);
    expect(query._parameters['fieldUid']).toEqual({ '$in': ['value1', 'value2'] });
  });

  it('should add a notContainedIn parameter to _parameters', () => {
    query.notContainedIn('fieldUid', ['value1', 'value2']);
    expect(query._parameters['fieldUid']).toEqual({ '$nin': ['value1', 'value2'] });
  });

  it('should add an exists parameter to _parameters', () => {
    query.exists('fieldUid');
    expect(query._parameters['fieldUid']).toEqual({ '$exists': true });
  });

  it('should add a notExists parameter to _parameters', () => {
    query.notExists('fieldUid');
    expect(query._parameters['fieldUid']).toEqual({ '$exists': false });
  });

  it('should add an equalTo parameter to _parameters', () => {
    query.equalTo('fieldUid', 'value');
    expect(query._parameters['fieldUid']).toEqual('value');
  });

  it('should add a notEqualTo parameter to _parameters', () => {
    query.notEqualTo('fieldUid', 'value');
    expect(query._parameters['fieldUid']).toEqual({ '$ne': 'value' });
  });

  it('should add a lessThan parameter to _parameters', () => {
    query.lessThan('fieldUid', 10);
    expect(query._parameters['fieldUid']).toEqual({ '$lt': 10 });
  });

  it('should add a lessThanOrEqualTo parameter to _parameters', () => {
    query.lessThanOrEqualTo('fieldUid', 10);
    expect(query._parameters['fieldUid']).toEqual({ '$lte': 10 });
  });

  it('should add a greaterThan parameter to _parameters', () => {
    query.greaterThan('fieldUid', 10);
    expect(query._parameters['fieldUid']).toEqual({ '$gt': 10 });
  });

  it('should add a greaterThanOrEqualTo parameter to _parameters', () => {
    query.greaterThanOrEqualTo('fieldUid', 10);
    expect(query._parameters['fieldUid']).toEqual({ '$gte': 10 });
  });

  it('should add a tags parameter to _parameters', () => {
    query.tags(['tag1', 'tag2']);
    expect(query._parameters['tags']).toEqual(['tag1', 'tag2']);
  });

  it('should add a search parameter to _queryParams', () => {
    query.search('searchKey');
    expect(query._queryParams['typeahead']).toEqual('searchKey');
  });

  it('should provide proper response when find method is called', async () => {
    mockClient.onGet(`/content_types/contentTypeUid/entries`).reply(200, entryFindMock);
    const returnedValue = await query.find();
    expect(returnedValue).toEqual(entryFindMock);
  });

  it('should provide proper response when find method is called', async () => {
    mockClient.onGet(`/content_types/contentTypeUid/entries`).reply(200, entryFindMock);
    const returnedValue = await query.find();
    expect(returnedValue).toEqual(entryFindMock);
  });
});

function getQueryObject(client: AxiosInstance, uid: string, queryObj?: { [key: string]: any }) {
  if (queryObj) return new Query(client, {}, {}, '', uid, queryObj);

  return new Query(client, {}, {}, '', uid);
}
