const path = require('path');
const webpack = require('webpack');
module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public')
  },
  plugins: [
    new webpack.DefinePlugin({
      AUTH_URL: JSON.stringify(process.env.AUTH_URL || 'https://xfa3-mghj-yd9n.n7c.xano.io/api:xhKh0vlR'),
      BASE_URL: JSON.stringify(process.env.BASE_URL || 'https://xfa3-mghj-yd9n.n7c.xano.io/api:ghdeJJTr'),
      DOMAIN_URL: JSON.stringify(process.env.DOMAIN_URL || 'https://worldify.webflow.io')
    })
  ]
};
