/**
 * Centralized Error Handling Validation Tests
 * 
 * Purpose: Test SDK validation logic that prevents customer errors
 * Focus: PRODUCTION ISSUE CATCHING - Real mistakes customers make
 * 
 * Based on ACTUAL SDK code review:
 * - src/lib/entries.ts: includeReference() validation
 * - src/lib/entry.ts: includeReference() validation
 * - src/lib/query.ts: key/value validation (isValidAlphanumeric)
 * 
 * Why These Tests Matter:
 * - Catch common customer mistakes before API calls
 * - Prevent invalid API requests that waste quota
 * - Provide clear error messages at development time
 * - Reduce support tickets from confused customers
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import contentstack from '../../src/index';
import { ErrorMessages } from '../../src/lib/error-messages';

// Mock console.error to capture validation messages
let consoleErrorSpy: ReturnType<typeof jest.spyOn>;

beforeEach(() => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

describe('Entries.includeReference() Validation - Production Scenarios', () => {
  
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test'
  });

  /**
   * PRODUCTION SCENARIO: Customer forgets to pass reference field UID
   * Common mistake: .includeReference() with no arguments
   * Expected: Shows error, returns this for chaining
   */
  it('should log error when includeReference called with no arguments', () => {
    const entries = stack.contentType('test_ct').entry();
    
    // @ts-ignore - Testing runtime validation
    const result = entries.includeReference();
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_ARGUMENT_STRING_OR_ARRAY);
    expect(result).toBe(entries); // Should still return this for chaining
  });

  /**
   * PRODUCTION SCENARIO: Customer passes valid string reference
   * Happy path: Should work without errors
   */
  it('should accept valid string reference field UID', () => {
    const entries = stack.contentType('test_ct').entry();
    
    const result = entries.includeReference('valid_reference_field');
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(entries);
  });

  /**
   * PRODUCTION SCENARIO: Customer passes array of references
   * Happy path: Should work without errors
   */
  it('should accept array of reference field UIDs', () => {
    const entries = stack.contentType('test_ct').entry();
    
    const result = entries.includeReference(['ref1', 'ref2', 'ref3']);
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(entries);
  });

  /**
   * PRODUCTION SCENARIO: Customer mixes strings and arrays
   * Happy path: Should flatten and work correctly
   */
  it('should accept mixed string and array arguments', () => {
    const entries = stack.contentType('test_ct').entry();
    
    const result = entries.includeReference('ref1', ['ref2', 'ref3'], 'ref4');
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(entries);
  });

  /**
   * PRODUCTION SCENARIO: Customer accidentally passes empty array
   * Edge case: Should still work (forEach does nothing)
   */
  it('should handle empty array gracefully', () => {
    const entries = stack.contentType('test_ct').entry();
    
    const result = entries.includeReference([]);
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});

describe('Entry.includeReference() Validation - Production Scenarios', () => {
  
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test'
  });

  /**
   * PRODUCTION SCENARIO: Customer forgets to pass reference field UID
   * Common mistake: .includeReference() with no arguments on single entry
   */
  it('should log error when includeReference called with no arguments', () => {
    const entry = stack.contentType('test_ct').entry('test_entry_uid');
    
    // @ts-ignore - Testing runtime validation
    const result = entry.includeReference();
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_ARGUMENT_STRING_OR_ARRAY);
    expect(result).toBe(entry);
  });

  /**
   * PRODUCTION SCENARIO: Customer passes valid reference on single entry
   * Happy path: Should work without errors
   */
  it('should accept valid string reference field UID', () => {
    const entry = stack.contentType('test_ct').entry('test_entry_uid');
    
    const result = entry.includeReference('valid_reference_field');
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(entry);
  });

  /**
   * PRODUCTION SCENARIO: Customer passes multiple references on single entry
   * Happy path: Should work without errors
   */
  it('should accept array of reference field UIDs', () => {
    const entry = stack.contentType('test_ct').entry('test_entry_uid');
    
    const result = entry.includeReference(['ref1', 'ref2']);
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(entry);
  });
});

describe('Query.equalTo() Key Validation - Production Scenarios', () => {
  
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test'
  });

  /**
   * PRODUCTION SCENARIO: Customer uses special characters in field key
   * Common mistake: Using email notation like 'user@email' instead of 'user_email'
   * Expected: Shows error, returns query for chaining
   */
  it('should reject key with @ symbol', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.equalTo('user@email', 'test@example.com');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_KEY);
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Customer uses spaces in field key
   * Common mistake: 'first name' instead of 'first_name'
   */
  it('should reject key with spaces', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.equalTo('first name', 'John');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_KEY);
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Customer uses special characters
   * Common mistake: Using characters not allowed in field UIDs
   */
  it('should reject key with exclamation mark', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.equalTo('field!name', 'value');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_KEY);
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Valid alphanumeric keys should work
   * Happy path: Common field naming patterns
   */
  it('should accept valid alphanumeric key with underscores', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.equalTo('user_name', 'John');
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Valid keys with dots (nested fields)
   * Happy path: Contentstack supports dot notation
   */
  it('should accept valid key with dots for nested fields', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.equalTo('user.profile.name', 'John');
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Valid keys with hyphens
   * Happy path: Some field UIDs use hyphens
   */
  it('should accept valid key with hyphens', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.equalTo('user-name', 'John');
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(query);
  });
});

describe('Query.equalTo() Value Validation - Production Scenarios', () => {
  
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test'
  });

  /**
   * PRODUCTION SCENARIO: Customer passes null as value
   * Common mistake: query.equalTo('field', null) instead of query.exists('field', false)
   * Expected: Shows error, returns query for chaining
   */
  it('should reject null value', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.equalTo('field_name', null as any);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_VALUE_STRING_OR_NUMBER);
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Customer passes undefined as value
   * Common mistake: Variable not initialized
   */
  it('should reject undefined value', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.equalTo('field_name', undefined as any);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_VALUE_STRING_OR_NUMBER);
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Customer passes object as value
   * Common mistake: Forgetting to extract string from object
   */
  it('should reject object value', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.equalTo('field_name', { value: 'test' } as any);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_VALUE_STRING_OR_NUMBER);
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Customer passes array as value
   * Common mistake: Using equalTo instead of containedIn for array values
   */
  it('should reject array value', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.equalTo('field_name', ['value1', 'value2'] as any);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_VALUE_STRING_OR_NUMBER);
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Valid string value
   * Happy path: Should work without errors
   */
  it('should accept valid string value', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.equalTo('field_name', 'valid_value');
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Valid number value
   * Happy path: Should work without errors
   */
  it('should accept valid number value', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.equalTo('field_name', 42);
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Edge case - zero value
   * Happy path: Zero is a valid number
   */
  it('should accept zero as valid number value', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.equalTo('field_name', 0);
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Edge case - empty string
   * Happy path: Empty string is valid (checking for empty values)
   */
  it('should accept empty string as valid value', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.equalTo('field_name', '');
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(query);
  });
});

describe('Query.notEqualTo() Validation - Production Scenarios', () => {
  
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test'
  });

  /**
   * PRODUCTION SCENARIO: Same validation as equalTo for keys
   * Consistency: All query operators should validate keys the same way
   */
  it('should reject invalid key with special characters', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.notEqualTo('invalid@key', 'value');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_KEY);
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Same validation as equalTo for values
   * Consistency: Value validation should be consistent
   */
  it('should reject invalid value (object)', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.notEqualTo('field_name', { invalid: 'object' } as any);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_VALUE_STRING_OR_NUMBER);
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Valid usage
   * Happy path: Excluding specific values
   */
  it('should accept valid key and value', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.notEqualTo('status', 'archived');
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(query);
  });
});

describe('Query.referenceIn() Key Validation - Production Scenarios', () => {
  
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test'
  });

  /**
   * PRODUCTION SCENARIO: Customer uses invalid reference field key
   * Common mistake: Special characters in reference field UID
   */
  it('should reject invalid reference field key', () => {
    const query = stack.contentType('test_ct').entry().query();
    const subQuery = stack.contentType('other_ct').entry().query();
    
    const result = query.referenceIn('invalid@reference', subQuery);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_KEY);
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Valid reference field key
   * Happy path: Standard reference query pattern
   */
  it('should accept valid reference field key', () => {
    const query = stack.contentType('test_ct').entry().query();
    const subQuery = stack.contentType('other_ct').entry().query();
    
    const result = query.referenceIn('author_reference', subQuery);
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(query);
  });
});

describe('Query.referenceNotIn() Key Validation - Production Scenarios', () => {
  
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test'
  });

  /**
   * PRODUCTION SCENARIO: Same validation as referenceIn
   * Consistency: Reference operators should validate keys consistently
   */
  it('should reject invalid reference field key', () => {
    const query = stack.contentType('test_ct').entry().query();
    const subQuery = stack.contentType('other_ct').entry().query();
    
    const result = query.referenceNotIn('invalid@reference', subQuery);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_KEY);
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Valid reference exclusion
   * Happy path: Excluding entries with specific references
   */
  it('should accept valid reference field key', () => {
    const query = stack.contentType('test_ct').entry().query();
    const subQuery = stack.contentType('other_ct').entry().query();
    
    const result = query.referenceNotIn('author_reference', subQuery);
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(query);
  });
});

describe('Query Chaining After Validation Errors - Production Scenarios', () => {
  
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test'
  });

  /**
   * PRODUCTION SCENARIO: Customer chains multiple operations, one fails
   * Important: Should still allow chaining after validation error
   * Benefit: Prevents runtime crashes, allows graceful degradation
   */
  it('should allow chaining after validation error', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    // This should log error but return query for chaining
    const result = query
      .equalTo('invalid@key', 'value')  // Error logged
      .equalTo('valid_key', 'value')    // Should still work
      .limit(10);                        // Should still work
    
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_KEY);
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Multiple validation errors in chain
   * Important: Each error should be logged
   */
  it('should log each validation error in chain', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    query
      .equalTo('invalid@key1', 'value')  // Error 1
      .equalTo('invalid@key2', 'value')  // Error 2
      .equalTo('valid_key', null as any); // Error 3 (value)
    
    expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
  });
});

describe('Edge Cases - Production Error Prevention', () => {
  
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test'
  });

  /**
   * PRODUCTION SCENARIO: Empty string as key
   * Edge case: Should be rejected (not a valid field UID)
   */
  it('should reject empty string as key', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.equalTo('', 'value');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_KEY);
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Very long key name
   * Happy path: Should accept (Contentstack allows long field UIDs)
   */
  it('should accept very long valid key name', () => {
    const query = stack.contentType('test_ct').entry().query();
    const longKey = 'very_long_field_name_that_is_still_valid_alphanumeric_underscore';
    
    const result = query.equalTo(longKey, 'value');
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Numeric string vs number
   * Happy path: Both should be accepted (API handles both)
   */
  it('should accept numeric string as value', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    const result = query.equalTo('count', '42');
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result).toBe(query);
  });

  /**
   * PRODUCTION SCENARIO: Boolean value (allowed by TypeScript types)
   * Note: TypeScript signature includes boolean, but runtime validation only allows string|number
   * This is a type system vs runtime mismatch - test actual behavior
   */
  it('should handle boolean value according to runtime validation', () => {
    const query = stack.contentType('test_ct').entry().query();
    
    // Boolean is in the type signature but may not pass runtime validation
    const result = query.equalTo('is_published', true as any);
    
    // Based on src/lib/query.ts line 393: only checks for string or number
    // Boolean would fail the validation
    expect(consoleErrorSpy).toHaveBeenCalledWith(ErrorMessages.INVALID_VALUE_STRING_OR_NUMBER);
  });
});

