import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/bundle.cjs',
  format: 'cjs',
  // esbuild handles JSON natively
  loader: {
    '.json': 'json',
  },
  logLevel: 'info',
});

console.log('✓ esbuild completed');

