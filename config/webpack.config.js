import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// Replicating __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, '../dist/umd'),
    filename: 'index.js',
    library: 'exampleTypescriptPackage',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.ts(x*)?$/,
        exclude: path.resolve(__dirname, "node_modules"),
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, "tsconfig.umd.json"),
          },
        },
      },
      {
        test: /node-localstorage/,
        use: 'ignore-loader',
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
    fallback: { 
      path: path.resolve("path-browserify") 
    }
  },
};
