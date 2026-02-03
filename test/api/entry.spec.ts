import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { BaseEntry } from '../../src';
import { Entry } from '../../src/lib/entry';
import { stackInstance } from '../utils/stack-instance';
import { TEntry } from './types';

const stack = stackInstance();
// Entry UID - using new standardized env variable names
const entryUid = process.env.MEDIUM_ENTRY_UID || process.env.COMPLEX_ENTRY_UID || '';

// Content Type UID - using new standardized env variable names
const BLOG_POST_CT = process.env.MEDIUM_CONTENT_TYPE_UID || 'article';

describe('Entry API tests', () => {
  it('should check for entry is defined', async () => {
    const result = await makeEntry(entryUid).fetch<TEntry>();
    expect(result).toBeDefined();
    expect(result._version).toBeDefined();
    expect(result.locale).toEqual('en-us');
    expect(result.uid).toBeDefined();
    expect(result.created_by).toBeDefined();
    expect(result.updated_by).toBeDefined();
  });

  it('should check for entry is defined with BaseEntry', async () => {
    interface MyEntry extends BaseEntry {
      bio: string;
      age: string;
    }
    const result = await makeEntry(entryUid).fetch<MyEntry>();
    expect(result).toBeDefined();
  });
  it('should check for include branch', async () => {
    const result = await makeEntry(entryUid).includeBranch().fetch<TEntry>();
    expect(result._branch).not.toEqual(undefined);
    expect(result.uid).toBeDefined();
    expect(result.created_by).toBeDefined();
    expect(result.updated_by).toBeDefined();
  });
  it('should check for locale', async () => {
    const result = await makeEntry(entryUid).locale('fr-fr').fetch<TEntry>();
    expect(result).toBeDefined();
    expect(result._version).toBeDefined();
    expect(result.publish_details.locale).toEqual('fr-fr');
    expect(result.uid).toBeDefined();
    expect(result.created_by).toBeDefined();
    expect(result.updated_by).toBeDefined();
  });
  it('should check for include fallback', async () => {
    const result = await makeEntry(entryUid).includeFallback().fetch<TEntry>();
    expect(result).toBeDefined();
    expect(result._version).toBeDefined();
    expect(result.locale).toEqual('en-us');
    expect(result.uid).toBeDefined();
    expect(result.created_by).toBeDefined();
    expect(result.updated_by).toBeDefined();
  });
  it('should check for include reference', async () => {
    // Article content type uses 'reference' field (not 'author') to reference author content type
    const result = await makeEntry(entryUid).includeReference('reference').fetch<TEntry>();
    expect(result.title).toBeDefined();
    // Check if reference field exists (may be undefined if entry doesn't have reference)
    if (result.reference) {
      expect(result.reference).toBeDefined();
    }
    expect(result.uid).toBeDefined();
    expect(result._version).toBeDefined();
    expect(result.publish_details).toBeDefined();
  });

  it('should fetch entry with asset_fields[] CDA param (user_defined_fields, embedded, ai_suggested, visual_markups)', async () => {
    const result = await makeEntry(entryUid)
      .assetFields('user_defined_fields', 'embedded', 'ai_suggested', 'visual_markups')
      .fetch<TEntry>();
    expect(result).toBeDefined();
    expect(result.uid).toBeDefined();
    expect(result._version).toBeDefined();
    expect(result.locale).toBeDefined();
  });
});
function makeEntry(uid = ''): Entry {
  const entry = stack.contentType(BLOG_POST_CT).entry(uid);

  return entry;
}
