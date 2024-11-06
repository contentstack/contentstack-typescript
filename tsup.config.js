import { defineConfig } from 'tsup'
import { esbuildPluginFilePathExtensions } from 'esbuild-plugin-file-path-extensions'
import packageJson from './package.json' assert { type: "json" };

export default defineConfig([
  modernConfig({
    entry: ["src/**/*.ts","src/**/*.tsx", "!src/**/__test__", "!**/*.test.ts"],
}),
legacyConfig({
    entry: ["src/**/*.ts","src/**/*.tsx", "!src/**/__test__", "!**/*.test.ts"],
}),
])

function modernConfig(opts) {
  return {
    entry: opts.entry,
    define: {
      'process.env.PACKAGE_VERSION': `"${packageJson.version}"`,
    },
    esbuildOptions(options) {
      options.jsxImportSource = 'preact';
      options.jsx = 'automatic'
    },      
    format: ['cjs', 'esm'],
    target: ['chrome91', 'firefox90', 'edge91', 'safari15', 'ios15', 'opera77'],
    outDir: 'dist/modern',
    dts: true,
    sourcemap: true,
    clean: true,
    esbuildPlugins: [esbuildPluginFilePathExtensions({ esmExtension: 'js' })]
  }
}

function legacyConfig(opts) {
  return {
    entry: opts.entry,
    define: {
      'process.env.PACKAGE_VERSION': `"${packageJson.version}"`,
    },
    format: ['cjs', 'esm'],
    target: ['es2020', 'node16'],
    outDir: 'dist/legacy',
    dts: true,
    sourcemap: true,
    clean: true,
    esbuildPlugins: [esbuildPluginFilePathExtensions({ esmExtension: 'js' })],
    esbuildOptions(options) {
      options.jsxImportSource = 'preact';
      options.jsx = 'automatic'
    },
  }
}