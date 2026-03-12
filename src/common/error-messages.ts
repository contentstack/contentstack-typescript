/**
 * Centralized error messages for the Contentstack SDK
 * This file contains all user-facing error messages used throughout the SDK
 */

export const ErrorMessages = {
  // Field/Key validation errors
  INVALID_FIELD_UID: 'Invalid fieldUid. Provide an alphanumeric field UID and try again.',
  INVALID_KEY: 'Invalid key. Provide an alphanumeric key and try again.',
  INVALID_REFERENCE_UID: (uid: string) => `Invalid referenceUid: ${uid}. Must be alphanumeric.`,
  
  // Value validation errors
  INVALID_VALUE_STRING_OR_NUMBER: 'Invalid value. Provide a string or number and try again.',
  INVALID_VALUE_ARRAY: 'Invalid value. Provide an array of strings, numbers, or booleans and try again.',
  INVALID_ARGUMENT_STRING_OR_ARRAY: 'Invalid argument. Provide a string or an array and try again.',
  
  // Cache persistence errors
  MISSING_PERSISTENCE_STORE:
    'Cache policy requires cacheOptions.persistenceStore (storage). Install @contentstack/persistence-plugin and pass a PersistenceStore instance and try again.',
  
  // Regex validation errors
  INVALID_REGEX_PATTERN: 'Invalid regexPattern: Must be a valid regular expression',
  
  // Slack/Integration errors (for future use if sanity-report-ts-sdk.js is added)
  SLACK_MESSAGE_FAILED: (details?: string) => 
    `Failed to send Slack message. Check the SLACK_WEBHOOK_URL and SLACK_CHANNEL configuration and try again.${details ? ` Details: ${details}` : ''}`,
  SLACK_FAILURE_DETAILS_FAILED: (details?: string) => 
    `Failed to send failure details to Slack. Verify SLACK_WEBHOOK_URL, SLACK_CHANNEL, and SLACK_TOKEN settings and try again.${details ? ` Details: ${details}` : ''}`,
} as const;

/**
 * Error codes for programmatic error handling
 */
export enum ErrorCode {
  INVALID_FIELD_UID = 'INVALID_FIELD_UID',
  INVALID_KEY = 'INVALID_KEY',
  INVALID_REFERENCE_UID = 'INVALID_REFERENCE_UID',
  INVALID_VALUE = 'INVALID_VALUE',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  MISSING_STORAGE = 'MISSING_STORAGE',
  INVALID_REGEX = 'INVALID_REGEX',
  SLACK_ERROR = 'SLACK_ERROR',
}
