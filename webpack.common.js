const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package.json');

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: `bundle.${packageJson.version}.js`,
    path: path.resolve(__dirname, 'public')
  },
  plugins: [
    new webpack.DefinePlugin({
      AUTH_URL: JSON.stringify(process.env.AUTH_URL || 'https://xfa3-mghj-yd9n.n7c.xano.io/api:xhKh0vlR'),
      BASE_URL: JSON.stringify(process.env.BASE_URL || 'https://xfa3-mghj-yd9n.n7c.xano.io/api:ghdeJJTr'),
      XANO_BASE: JSON.stringify(process.env.XANO_BASE || 'https://xfa3-mghj-yd9n.n7c.xano.io'),
      DOMAIN_URL: JSON.stringify(process.env.DOMAIN_URL || 'https://www.getworldify.com/'),
      'process.platform': JSON.stringify('browser')
    })
  ]
};
