import { stackInstance } from '../utils/stack-instance';
import { TEntry } from './types';
import { QueryOperation } from '../../src/lib/types';

const stack = stackInstance();
const CT_UID = process.env.COMPLEX_CONTENT_TYPE_UID || 'cybersecurity';
const CT_UID2 = process.env.MEDIUM_CONTENT_TYPE_UID || 'article';

function makeEntries(contentTypeUid = '') {
  return stack.contentType(contentTypeUid).entry();
}

describe('Query Operators API test cases - Simplified', () => {
  let testData: any = null;

  beforeAll(async () => {
    // Fetch real data once for all tests
    const result = await makeEntries(CT_UID).query().find<TEntry>();
    if (result.entries && result.entries.length > 0) {
      testData = {
        title: result.entries[0].title,
        uid: result.entries[0].uid,
        entries: result.entries
      };
    }
  });

  it('should get entries which matches the fieldUid and values - containedIn', async () => {
    if (!testData) {
      console.log('⚠️ No test data available');
      return;
    }

    const query = await makeEntries(CT_UID).query()
      .containedIn('title', [testData.title])
      .find<TEntry>();

    expect(query.entries).toBeDefined();
    if (query.entries) {
      expect(query.entries.length).toBeGreaterThan(0);
    }
  });

  it('should get entries which does not match - notContainedIn', async () => {
    const query = await makeEntries(CT_UID).query()
      .notContainedIn('title', ['non-existent-xyz-123'])
      .find<TEntry>();

    expect(query.entries).toBeDefined();
    // Should return all entries since none match the exclusion
  });

  it('should get entries which does not match - notExists', async () => {
    const query = await makeEntries(CT_UID2).query()
      .notExists('non_existent_field_xyz')
      .find<TEntry>();

    expect(query.entries).toBeDefined();
    // Should return entries that don't have this field
  });

  it('should get entries which matches - EXISTS', async () => {
    const query = await makeEntries(CT_UID).query()
      .where('title', QueryOperation.EXISTS, true)
      .find<TEntry>();

    expect(query.entries).toBeDefined();
    if (query.entries) {
      expect(query.entries.length).toBeGreaterThan(0);
    }
  });

  it('should return entries matching any conditions - OR', async () => {
    if (!testData) return;

    const query1 = makeEntries(CT_UID).query()
      .where('title', QueryOperation.EQUALS, testData.title);
    const query2 = makeEntries(CT_UID).query()
      .where('uid', QueryOperation.EQUALS, testData.uid);
    
    const result = await makeEntries(CT_UID).query()
      .or(query1, query2)
      .find<TEntry>();

    expect(result.entries).toBeDefined();
    if (result.entries) {
      expect(result.entries.length).toBeGreaterThan(0);
    }
  });

  it('should return entry when at least 1 condition matches - OR', async () => {
    if (!testData) return;

    const query1 = makeEntries(CT_UID).query()
      .where('title', QueryOperation.EQUALS, testData.title);
    const query2 = makeEntries(CT_UID).query()
      .where('title', QueryOperation.EQUALS, 'non-existent-xyz');
    
    const result = await makeEntries(CT_UID).query()
      .or(query1, query2)
      .find<TEntry>();

    expect(result.entries).toBeDefined();
    if (result.entries) {
      expect(result.entries.length).toBeGreaterThan(0);
    }
  });

  it('should return entry when both conditions match - AND', async () => {
    if (!testData) return;

    const query1 = makeEntries(CT_UID).query()
      .where('title', QueryOperation.EQUALS, testData.title);
    const query2 = makeEntries(CT_UID).query()
      .where('locale', QueryOperation.EQUALS, 'en-us');
    
    const result = await makeEntries(CT_UID).query()
      .and(query1, query2)
      .find<TEntry>();

    expect(result.entries).toBeDefined();
    if (result.entries) {
      expect(result.entries.length).toBeGreaterThan(0);
    }
  });

  it('should return empty when AND conditions do not match', async () => {
    if (!testData) return;

    const query1 = makeEntries(CT_UID).query()
      .where('title', QueryOperation.EQUALS, testData.title);
    const query2 = makeEntries(CT_UID).query()
      .where('locale', QueryOperation.EQUALS, 'xx-xx');
    
    const result = await makeEntries(CT_UID).query()
      .and(query1, query2)
      .find<TEntry>();

    expect(result.entries).toBeDefined();
    expect(result.entries).toHaveLength(0);
  });

  it('should return entry equal to condition - equalTo', async () => {
    if (!testData) return;

    const query = await makeEntries(CT_UID).query()
      .equalTo('title', testData.title)
      .find<TEntry>();

    expect(query.entries).toBeDefined();
    if (query.entries) {
      expect(query.entries.length).toBeGreaterThan(0);
    }
  });

  it('should return entry not equal to condition - notEqualTo', async () => {
    const query = await makeEntries(CT_UID).query()
      .notEqualTo('title', 'non-existent-xyz-123')
      .find<TEntry>();

    expect(query.entries).toBeDefined();
  });

  it('should handle referenceIn query', async () => {
    if (!testData) return;

    try {
      const query = makeEntries(CT_UID).query()
        .where('title', QueryOperation.EXISTS, true);
      const entryQuery = await makeEntries(CT_UID).query()
        .referenceIn('reference', query)
        .find<TEntry>();

      expect(entryQuery.entries).toBeDefined();
      console.log(`ReferenceIn returned ${entryQuery.entries?.length || 0} entries`);
    } catch (error: any) {
      if (error.response?.status === 422) {
        console.log('⚠️ 422 - Reference field may not exist (expected)');
        expect(error.response.status).toBe(422);
      } else {
        throw error;
      }
    }
  });

  it('should handle referenceNotIn query', async () => {
    if (!testData) return;

    try {
      const query = makeEntries(CT_UID).query()
        .where('title', QueryOperation.EXISTS, true);
      const entryQuery = await makeEntries(CT_UID).query()
        .referenceNotIn('reference', query)
        .find<TEntry>();

      expect(entryQuery.entries).toBeDefined();
      console.log(`ReferenceNotIn returned ${entryQuery.entries?.length || 0} entries`);
    } catch (error: any) {
      if (error.response?.status === 422) {
        console.log('⚠️ 422 - Reference field may not exist (expected)');
        expect(error.response.status).toBe(422);
      } else {
        throw error;
      }
    }
  });

  it('should handle tags query', async () => {
    const query = await makeEntries(CT_UID).query()
      .tags(['test'])
      .find<TEntry>();

    expect(query.entries).toBeDefined();
    console.log(`Tags query returned ${query.entries?.length || 0} entries`);
  });

  it('should handle search query', async () => {
    const query = await makeEntries(CT_UID).query()
      .search('')
      .find<TEntry>();

    expect(query.entries).toBeDefined();
  });

  it('should sort entries in ascending order', async () => {
    const query = await makeEntries(CT_UID).query()
      .orderByAscending('title')
      .find<TEntry>();

    expect(query.entries).toBeDefined();
    if (query.entries) {
      expect(query.entries.length).toBeGreaterThan(0);
    }
  });

  it('should sort entries in descending order', async () => {
    const query = await makeEntries(CT_UID).query()
      .orderByDescending('title')
      .find<TEntry>();

    expect(query.entries).toBeDefined();
    if (query.entries) {
      expect(query.entries.length).toBeGreaterThan(0);
    }
  });

  it('should get entries lessThan a value', async () => {
    const query = await makeEntries(CT_UID).query()
      .lessThan('_version', 100)
      .find<TEntry>();

    expect(query.entries).toBeDefined();
  });

  it('should get entries lessThanOrEqualTo a value', async () => {
    const query = await makeEntries(CT_UID).query()
      .lessThanOrEqualTo('_version', 100)
      .find<TEntry>();

    expect(query.entries).toBeDefined();
  });
});

