import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.cjs',
    format: 'cjs',
    exports: 'auto',
  },
  plugins: [
    // JSON plugin is critical for region data
    json(),
    resolve({
      preferBuiltins: false,
    }),
    commonjs(),
  ],
  external: [],
};

