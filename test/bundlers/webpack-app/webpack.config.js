const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  target: 'node', // Test for Node.js environment first
  resolve: {
    extensions: ['.js', '.json'],
  },
  // Ensure JSON files are handled properly
  module: {
    rules: [
      {
        test: /\.json$/,
        type: 'json',
      },
    ],
  },
};

