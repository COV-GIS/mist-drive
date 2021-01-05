const path = require('path');

/**
 * Application configuration.
 */

// Application information.
const title = 'ArcGIS Typescript, Sass and Webpack Template';
const description = 'ArcGIS JavaScript template application with Typescript, Sass and Webpack.';
const themeColor = '#FFFFFF';
const deployUrl = 'https://localhost:3001/';
const appImageUrl = 'socialcard.png';

// HTML plugin options for index.ejs. Primarily for title and meta tags.
// Mixes in...be careful.
// https://github.com/jantimon/html-webpack-plugin#options
const indexHtml = {
  title,
  meta: {
    'viewport': 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'theme-color': themeColor,
    'og:url': deployUrl,
    'og:type': 'website',
    'og:site_name': title,
    'og:title': title,
    'og:description': description,
    'og:image': appImageUrl,
  },
};

// Webpack devtool.
// https://webpack.js.org/configuration/devtool/
const developmentDevtool = 'eval';
const productionDevtool = 'source-map';

// Add any aliases to config.resolve.
// Useful for aliasing packages or paths in source.
// https://webpack.js.org/configuration/resolve/#resolvealias
const resolveAlias = {
  cov: path.resolve(__dirname, 'src/cov'),
};

// Workbox service workers.
// Important! Read up on and understand Workbox before use: https://developers.google.com/web/tools/workbox
// There are browser cache and other repercussions for deploying an app with Workbox.
const workbox = false;
// Exclude files or patterns from Workbox.
const workboxExcludes = [];

/**
 * Webpack plugins.
 */
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;
const ArcGISPlugin = require('@arcgis/webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');

/**
 * Webpack configuration.
 * 
 * Editing only required to add additional plugins or effect how Webpack operates.
 */
module.exports = (_, args) => {
  const mode = args.mode;

  const config = {
    // https://webpack.js.org/configuration/node/
    node: false,

    // Entry points.
    entry: {
      index: ['./src/index.scss', './src/index.ts']
    },

    // Output parameters.
    output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].[chunkhash].js',
      chunkFilename: 'chunks/[id].js',
      publicPath: '',
    },

    // Development server parameters.
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      historyApiFallback: true,
      compress: true,
      https: true,
      port: 8080,
      writeToDisk: true,
      open: true,
    },

    devtool: mode === 'development' ? developmentDevtool : productionDevtool,

    // Optimize output in production only.
    optimization: {
      minimize: mode === 'production',
      splitChunks: { minChunks: Infinity, chunks: 'all' },
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            output: {
              comments: false,
            },
          },
        }),
        new CssMinimizerPlugin(),
      ],
      runtimeChunk: {
        name: 'runtime',
      }
    },

    // Module handling and loaders.
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.(ttf|eot|svg|png|jpg|gif|ico|wsv|otf|woff(2)?)(\?[a-z0-9]+)?$/,
          use: [
            {
              loader: 'file-loader'
            }
          ]
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                url: false,
                importLoaders: 2,
              },
            },
            {
              loader: 'resolve-url-loader',
              options: {
                sourceMap: true,
                debug: mode === 'development',
                join: (rul_uri, rul_base) => { // args must be included
                  return (assetPath, absolutePath) => {
                    // ArcGISPlugin copies assets and cannot be resolved when using api sass
                    // replace relative path with absolute path in `dist` so files can be found for resolving
                    return absolutePath.includes('@arcgis/core') ? assetPath.replace('../', './assets/esri/themes/') : assetPath;
                  }
                }
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
      ]
    },

    // Configure how modules are resolved.
    resolve: {
      modules: [
        path.resolve(__dirname, 'cov'),
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'node_modules'),
      ],
      alias: resolveAlias || {},
      extensions: ['.ts', '.tsx', '.js', '.scss', '.css'],
    },

    // Webpack plugins.
    plugins: [
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false,
      }),

      new ArcGISPlugin({ locales: ['en'] }),

      new HtmlWebPackPlugin({
        template: './src/index.ejs',
        filename: 'index.html',
        chunksSortMode: 'none',
        hash: true,
        mode: mode,
        showErrors: mode === 'development',
        ...indexHtml,
      }),

      new HtmlWebPackPlugin({
        template: './src/oauth-callback.html',
        filename: 'oauth-callback.html',
        inject: false,
      }),

      new MiniCssExtractPlugin({
        filename: "[name].[chunkhash].css",
        chunkFilename: "[id].css"
      }),

      new HTMLInlineCSSWebpackPlugin({
        filter: (fileName) => {
          return fileName.includes('index');
        },
      }),
    ],
  };

  // Workbox plugin.
  if (mode === 'production' && workbox) {
    config.plugins.push(
      new GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        exclude: [...workboxExcludes],
      }),
    );
  }

  return config;
};