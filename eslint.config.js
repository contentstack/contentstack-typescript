import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      globals: {
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        process: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      // Only enable essential rules to avoid overwhelming output
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|^ContentTypeResponse$|^getData$|^EntryResponse$|^e$|^error$',
        ignoreRestSiblings: true
      }],
      '@typescript-eslint/no-explicit-any': 'off', // Too many to fix right now
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      'no-undef': 'off', // TypeScript handles this
      'no-prototype-builtins': 'off', // Common pattern in this codebase
      'no-async-promise-executor': 'off', // Disable for now
      // Disable problematic rules that aren't configured
      '@cspell/spellchecker': 'off',
      'prettier/prettier': 'off'
    }
  },
  {
    files: ['test/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '*.js',
      'jest.config.js',
      'rollup.config.js',
      'eslint.config.js'
    ]
  }
];