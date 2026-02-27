import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import replace from '@rollup/plugin-replace';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = require(path.join(__dirname, 'package.json'));

const version = packageJson.version;

/**
 * Plugin to add .js extension to relative imports in ESM output for Node ESM resolution.
 */
function addJsExtension() {
  return {
    name: 'add-js-extension',
    renderChunk(code, chunk, options) {
      if (options.format !== 'es') return null;
      return {
        code: code.replace(
          /from\s+(['"])(\.\/[^'"]*?)\1/g,
          (_, quote, specifier) =>
            specifier.endsWith('.js')
              ? `from ${quote}${specifier}${quote}`
              : `from ${quote}${specifier}.js${quote}`
        ),
        map: null,
      };
    },
  };
}

function createBuildConfig({ outDir, target, label }) {
  return {
    input: 'src/index.ts',
    output: [
      {
        dir: outDir,
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      {
        dir: outDir,
        format: 'cjs',
        entryFileNames: '[name].cjs',
        chunkFileNames: '[name].cjs',
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: 'src',
        exports: 'named',
      },
    ],
    external: (id) => {
      if (id.startsWith('\0')) return false;
      if (path.isAbsolute(id)) return false;
      if (id.startsWith('.') || id.startsWith('src/') || id === 'src') return false;
      return true;
    },
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          'process.env.PACKAGE_VERSION': JSON.stringify(version),
          '{{VERSION}}': JSON.stringify(version),
        },
      }),
      resolve({ extensions: ['.ts', '.js'] }),
      commonjs(),
      esbuild({
        tsconfig: path.join(__dirname, 'tsconfig.json'),
        target,
        loaders: { '.ts': 'ts' },
      }),
      addJsExtension(),
    ],
    treeshake: { moduleSideEffects: 'no-external' },
  };
}

export default [
  createBuildConfig({
    outDir: 'dist/modern',
    target: 'chrome91',
    label: 'modern',
  }),
  createBuildConfig({
    outDir: 'dist/legacy',
    target: 'es2020',
    label: 'legacy',
  }),
];
