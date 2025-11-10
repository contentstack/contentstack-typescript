/**
 * Global Jest Setup File
 * 
 * Suppresses expected SDK validation errors to reduce console noise during tests.
 * These errors are intentional - tests verify that the SDK handles invalid inputs gracefully.
 */

// Store the original console.error for genuine errors
const originalConsoleError = console.error;

// List of expected SDK validation errors to suppress
const expectedErrors = [
  'Invalid key:',                                      // From query.search() validation
  'Invalid value (expected string or number):',       // From query.equalTo() validation
  'Argument should be a String or an Array.',         // From entry/entries.includeReference() validation
  'Invalid fieldUid:',                                 // From asset query validation
];

// Override console.error globally to filter expected validation errors
console.error = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  
  // Check if this is an expected SDK validation error
  const isExpectedError = expectedErrors.some(pattern => message.includes(pattern));
  
  // If not expected, show it (for genuine errors)
  if (!isExpectedError) {
    originalConsoleError.apply(console, args);
  }
  // Otherwise, silently suppress it
};

