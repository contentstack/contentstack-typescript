// file deepcode ignore AttrAccessOnNull/test: <ignored in this unit test file due to the way method chaining is used with the contentType.entry().query() pattern.>
import { AxiosInstance, httpClient } from '@contentstack/core';
import { ContentType } from '../../src/lib/content-type';
import MockAdapter from 'axios-mock-adapter';
import { MOCK_CLIENT_OPTIONS } from '../utils/constant';
import { Query } from '../../src/lib/query';
import { QueryOperation } from '../../src/lib/types';


describe('Query Operators API test cases', () => {
    let contentType: ContentType;
    let client: AxiosInstance;
    let mockClient: MockAdapter;
  
    beforeAll(() => {
      client = httpClient(MOCK_CLIENT_OPTIONS);
      mockClient = new MockAdapter(client as any);
    });
  
    beforeEach(() => {
      contentType = new ContentType(client, 'contentTypeUid');
    });
    it('should get entries which matches the fieldUid and values', () => {
      const query = contentType.entry().query().containedIn('fieldUID', ['value']);
      expect(query._parameters).toEqual({'fieldUID': {'$in': ['value']}});
    });
    it('should get entries which does not match the fieldUid and values', () => {
      const query = contentType.entry().query().notContainedIn('fieldUID', ['value', 'value2']);
      expect(query._parameters).toEqual({'fieldUID': {'$nin': ['value', 'value2']}});
    });
    it('should get entries which does not match the fieldUid - notExists', () => {
      const query = contentType.entry().query().notExists('fieldUID');
      expect(query._parameters).toEqual({'fieldUID': {'$exists': false}});
    });
    it('should get entries which matches the fieldUid - exists', async () => {
      const query =  contentType.entry().query().exists('fieldUID');
      if (query) {
        expect(query._parameters).toEqual({'fieldUID': {'$exists': true}});
      }
    });
    it('should return entries matching any of the conditions - or', async () => {
      const query1: Query = contentType.entry().query().containedIn('fieldUID', ['value']);
      const query2: Query = contentType.entry().query().where('fieldUID', QueryOperation.EQUALS, 'value2');
      const query = contentType.entry().query().or(query1, query2);
      expect(query._parameters).toEqual({ '$or': [ {'fieldUID': {'$in': ['value']}}, { 'fieldUID': 'value2' } ] });
    });
    it('should return entry when both conditions are matching - and', async () => {
      const query1: Query = contentType.entry().query().containedIn('fieldUID', ['value']);
      const query2: Query = contentType.entry().query().where('fieldUID', QueryOperation.EQUALS, 'value2');
      const query = contentType.entry().query().and(query1, query2);
      expect(query._parameters).toEqual({ '$and': [ {'fieldUID': {'$in': ['value']}}, { 'fieldUID': 'value2' } ] });
    });
    it('should return entry equal to the condition - equalTo', async () => {
      const query = contentType.entry().query().equalTo('fieldUID', 'value');
      expect(query._parameters).toEqual({ 'fieldUID': 'value' });
    });
    it('should return entry equal to the condition - notEqualTo', async () => {
      const query = contentType.entry().query().notEqualTo('fieldUID', 'value');
      expect(query._parameters).toEqual({ 'fieldUID': {'$ne': 'value'} });
    });
    it('should return entry for referenceIn query', async () => {
      const query1 = contentType.entry().query().where('fieldUID', QueryOperation.EQUALS, 'value');
      const entryQuery = contentType.entry().query().referenceIn('reference_uid', query1);
      if (entryQuery) {
        expect(entryQuery._parameters).toEqual({ reference_uid: { '$in_query': { fieldUID: 'value' } } });
      }
    });
    it('should return entry for referenceNotIn query', async () => {
      const query1 = contentType.entry().query().where('fieldUID', QueryOperation.EQUALS, 'value');
      const entryQuery = contentType.entry().query().referenceNotIn('reference_uid', query1);
      if (entryQuery) {
        expect(entryQuery._parameters).toEqual({ reference_uid: { '$nin_query': { fieldUID: 'value' } } });
      }
    });
    it('should return entry if tags are matching', async () => {
      const query =  contentType.entry().query().tags(['tag1']);
      if (query) {
        expect(query._parameters).toEqual({ tags: ['tag1'] });
      }
    });
    it('should search for the matching key and return the entry', async () => {
      const query =  contentType.entry().query().search('entry');
      if (query) {
        expect(query._queryParams).toEqual({ typeahead: 'entry' });
      }
    });
    it('should sort entries in ascending order of the given fieldUID', async () => {
      const query =  contentType.entry().query().orderByAscending('fieldUid');
      if (query) {
        expect(query._queryParams).toEqual({ asc: 'fieldUid' });
      }
    });
    it('should sort entries in descending order of the given fieldUID', async () => {
      const query =  contentType.entry().query().orderByDescending('fieldUid');
      if (query) {
        expect(query._queryParams).toEqual({ desc: 'fieldUid' });
      }
    });
    it('should get entries which is lessThan the fieldUid and values', async () => {
      const query = contentType.entry().query().lessThan('fieldUID', 'value');
      expect(query._parameters).toEqual({'fieldUID': {'$lt': 'value'}});
    });
    it('should get entries which is lessThanOrEqualTo the fieldUid and values', async () => {
      const query = contentType.entry().query().lessThanOrEqualTo('fieldUID', 'value');
      expect(query._parameters).toEqual({'fieldUID': {'$lte': 'value'}});
    });
    it('should get entries which is greaterThan the fieldUid and values', async () => {
      const query = contentType.entry().query().greaterThan('fieldUID', 'value');
      expect(query._parameters).toEqual({'fieldUID': {'$gt': 'value'}});
    });
    it('should get entries which is greaterThanOrEqualTo the fieldUid and values', async () => {
      const query = contentType.entry().query().greaterThanOrEqualTo('fieldUID', 'value');
      expect(query._parameters).toEqual({'fieldUID': {'$gte': 'value'}});
    });
});