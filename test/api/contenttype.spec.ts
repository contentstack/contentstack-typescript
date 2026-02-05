/* eslint-disable no-console */
/* eslint-disable promise/always-return */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { ContentType } from '../../src/content-type';
import { stackInstance } from '../utils/stack-instance';
import { TContentType, TEntry } from './types';
import dotenv from 'dotenv';

dotenv.config()

const stack = stackInstance();

// Using new standardized env variable names
const MEDIUM_CT = process.env.MEDIUM_CONTENT_TYPE_UID || 'article';
const MEDIUM_ENTRY_UID = process.env.MEDIUM_ENTRY_UID || process.env.COMPLEX_ENTRY_UID || '';

describe('ContentType API test cases', () => {
  it('should give Entry instance when entry method is called with entryUid', async () => {
    const result = await makeContentType(MEDIUM_CT).entry(MEDIUM_ENTRY_UID).fetch<TEntry>();
    expect(result).toBeDefined();
  });
  it('should check for content_types of the given contentTypeUid', async () => {
    const result = await makeContentType(MEDIUM_CT).fetch<TContentType>();
    expect(result).toBeDefined();
    expect(result._version).toBeDefined();
    expect(result.title).toBeDefined();
    expect(result.description).toBeDefined();
    expect(result.uid).toBeDefined();
    expect(result.created_at).toBeDefined();
    expect(result.updated_at).toBeDefined();
    expect(result.schema).toBeDefined();
  });
});

function makeContentType(uid = ''): ContentType {
  const contentType = stack.contentType(uid);

  return contentType;
}
