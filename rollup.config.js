import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';
import packageJson from './package.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

// Get all TypeScript files in src directory
const input = Object.fromEntries(
  glob.sync('src/**/*.ts').map(file => [
    // Remove src/ and .ts extension to get the entry name
    path.relative('src', file.slice(0, file.length - path.extname(file).length)),
    // Full path for input
    file
  ])
);

// Base plugins for all builds
const basePlugins = [
  replace({
    '{{VERSION}}': `"${packageJson.version}"`,
    'process.env.PACKAGE_VERSION': `"${packageJson.version}"`,
    preventAssignment: true
  }),
  resolve({
    browser: true,
    preferBuiltins: false
  }),
  commonjs(),
  typescript({
    declaration: false, // We'll generate declarations separately
    declarationMap: false,
    sourceMap: true,
    outDir: undefined // Let Rollup handle the output directory
  })
];

// Production plugins
const productionPlugins = isProduction ? [terser()] : [];

export default [
  // ESM build for all modules
  {
    input,
    output: {
      dir: 'dist/esm',
      format: 'esm',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    plugins: [...basePlugins, ...productionPlugins],
    external: ['@contentstack/core', 'axios', 'humps']
  },
  
  // CommonJS build for all modules
  {
    input,
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    plugins: [...basePlugins, ...productionPlugins],
    external: ['@contentstack/core', 'axios', 'humps']
  },
  
  // Main bundle builds for backwards compatibility
  // ESM bundle
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [...basePlugins, ...productionPlugins],
    external: ['@contentstack/core', 'axios', 'humps']
  },
  
  // CommonJS bundle
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [...basePlugins, ...productionPlugins],
    external: ['@contentstack/core', 'axios', 'humps']
  },
  
  // UMD build for browsers
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'ContentstackDeliverySDK',
      sourcemap: true,
      exports: 'named',
      globals: {
        '@contentstack/core': 'ContentstackCore',
        'axios': 'axios',
        'humps': 'humps'
      }
    },
    plugins: [...basePlugins, ...productionPlugins],
    external: ['@contentstack/core', 'axios', 'humps']
  },
  
  // Type definitions for all modules
  {
    input,
    output: {
      dir: 'dist/types',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    plugins: [dts()],
    external: ['@contentstack/core', 'axios', 'humps']
  },
  
  // Main type definition bundle
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm'
    },
    plugins: [dts()],
    external: ['@contentstack/core', 'axios', 'humps']
  }
];