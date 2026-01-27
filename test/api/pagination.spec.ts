import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { stackInstance } from '../utils/stack-instance';
import { TEntry } from './types';

const stack = stackInstance();

// Using new standardized env variable names
const COMPLEX_CT = process.env.COMPLEX_CONTENT_TYPE_UID || 'cybersecurity';
const SIMPLE_CT = process.env.SIMPLE_CONTENT_TYPE_UID || 'author';

describe('Pagination API tests', () => {
  it('should paginate query to be defined', () => {
    const query = makePagination(COMPLEX_CT);
    expect(query).toBeDefined();
  });
  it('should change the skip value when next method is called', async () => {
    const query = makePagination(SIMPLE_CT, { skip: 2, limit: 2 });
    const result = await query.next().find<TEntry>();
    if (result.entries) {
      expect(query._queryParams).toEqual({ skip: 4, limit: 2 });
      // Handle case where there might not be enough entries for pagination
      if (result.entries.length > 0) {
        expect(result.entries[0]).toBeDefined();
        expect(result.entries[0]._version).toBeDefined();
        expect(result.entries[0].locale).toEqual('en-us');
        expect(result.entries[0].uid).toBeDefined();
        expect(result.entries[0].created_by).toBeDefined();
        expect(result.entries[0].updated_by).toBeDefined();
      } else {
        console.log('No entries found at skip=4 - insufficient data for pagination test');
      }
    }
  });

  it('should change the skip value when previous method is called', async () => {
    const query = makePagination(SIMPLE_CT, { skip: 10, limit: 10 });
    expect(query._queryParams).toEqual({ skip: 10, limit: 10 });

    const result = await query.previous().find<TEntry>();
    if (result.entries) {
      expect(query._queryParams).toEqual({ skip: 0, limit: 10 });
      expect(result.entries[0]).toBeDefined();
      expect(result.entries[0]._version).toBeDefined();
      expect(result.entries[0].locale).toEqual('en-us');
      expect(result.entries[0].uid).toBeDefined();
      expect(result.entries[0].created_by).toBeDefined();
      expect(result.entries[0].updated_by).toBeDefined();
    }
  });
});
function makePagination(uid = '', pageObj = {}) {
  const query = stack.contentType(uid).entry().paginate(pageObj);

  return query;
}
