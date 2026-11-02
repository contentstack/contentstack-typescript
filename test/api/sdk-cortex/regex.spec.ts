import { describe, it, expect, beforeAll } from '@jest/globals';
import { stackInstance } from '../../utils/stack-instance';

const ctUid = process.env.SIMPLE_CONTENT_TYPE_UID;

describe('Query.regex API tests', () => {
  beforeAll(() => {
    if (!ctUid) {
      throw new Error('Required env var SIMPLE_CONTENT_TYPE_UID is not set');
    }
  });

  it('should return entries matching a restrictive regex pattern on the title field', async () => {
    const stack = stackInstance();
    const result = await stack
      .contentType(ctUid!)
      .entry()
      .query()
      .regex('title', '^[A-Za-z]')
      .find<{ title: string }>();

    expect(result).toBeDefined();
    expect(result.entries).toBeDefined();
    if (result.entries && result.entries.length > 0) {
      result.entries.forEach((entry) => {
        expect(typeof entry.title).toBe('string');
        expect(entry.title).toMatch(/^[A-Za-z]/);
      });
    }
  });

  it('should return entries matching a regex pattern with options (case-insensitive)', async () => {
    const stack = stackInstance();
    const result = await stack
      .contentType(ctUid!)
      .entry()
      .query()
      .regex('title', '[a-z]', 'i')
      .find<{ title: string }>();

    expect(result).toBeDefined();
    expect(result.entries).toBeDefined();
    if (result.entries && result.entries.length > 0) {
      result.entries.forEach((entry) => {
        expect(typeof entry.title).toBe('string');
        expect(entry.title).toMatch(/[a-z]/i);
      });
    }
  });

  it('should handle an escaped regex pattern without throwing (DX-5325)', async () => {
    const stack = stackInstance();
    // Escaped pattern: "debt\?" — previously rejected by the SDK validator
    // We use a safe variant that matches a literal question mark optionally
    let result: Awaited<ReturnType<ReturnType<ReturnType<ReturnType<ReturnType<typeof stack.contentType>['entry']>['query']>['regex']>['find']>> | undefined;
    let thrownError: unknown;
    try {
      result = await stack
        .contentType(ctUid!)
        .entry()
        .query()
        .regex('title', 'test\\?')
        .find<{ title: string }>();
    } catch (err) {
      thrownError = err;
    }

    // The fix for DX-5325 ensures escaped patterns are accepted; no SDK-level validation error should be thrown
    expect(thrownError).toBeUndefined();
    expect(result).toBeDefined();
    expect(result!.entries).toBeDefined();
  });
});
