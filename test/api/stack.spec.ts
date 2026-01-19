import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { stackInstance } from '../utils/stack-instance';

const stack = stackInstance();

describe('Stack methods tests', () => {
  it('should check last activities', async () => {
    const result = await stack.getLastActivities();
    expect(result).toBeDefined();
    expect(result.content_types).toBeDefined();
    expect(Array.isArray(result.content_types)).toBe(true);
  });
});
