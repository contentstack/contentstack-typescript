#!/usr/bin/env node
/**
 * Build a browser-ready bundle of the SDK for E2E tests
 * This bundles the SDK with all its dependencies using esbuild
 */

import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sdkEntry = resolve(__dirname, '../../dist/modern/index.js');
const outputFile = resolve(__dirname, 'sdk-browser-bundle.js');

console.log('🔨 Building browser bundle for E2E tests...');
console.log('   Input:', sdkEntry);
console.log('   Output:', outputFile);

try {
  await esbuild.build({
    entryPoints: [sdkEntry],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outfile: outputFile,
    minify: false,
    sourcemap: true,
    target: ['es2020'],
  });
  
  console.log('✅ Browser bundle created successfully!');
} catch (error) {
  console.error('❌ Failed to build browser bundle:', error);
  process.exit(1);
}

