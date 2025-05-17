const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',
  
  // This is the entry point for our plugin code
  entry: './src/main.ts',
  
  // Development settings
  devtool: argv.mode === 'production' ? false : 'inline-source-map',
  
  // Output configuration
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    clean: true
  },
  
  // Module handling
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  
  // File resolution
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  
  // Plugins
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: '.' },
        { from: 'src/ui.html', to: '.' },
      ],
    }),
  ],
});