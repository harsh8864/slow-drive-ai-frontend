const webpack = require('webpack');

module.exports = function override(config) {
  // Add resolve fallbacks for node modules
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "assert": require.resolve("assert"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify"),
    "url": require.resolve("url"),
    "util": require.resolve("util"),
    "fs": false,
    "path": false,
    "process": require.resolve("process/browser")
  });
  config.resolve.fallback = fallback;

  // Add plugins
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ]);

  // Add resolve extensions
  config.resolve.extensions = [...(config.resolve.extensions || []), '.js', '.jsx', '.ts', '.tsx'];

  // Add module rules for ESM
  config.module = {
    ...config.module,
    rules: [
      ...(config.module.rules || []),
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      }
    ]
  };

  // Add aliases for TensorFlow.js
  config.resolve.alias = {
    ...config.resolve.alias,
    '@tensorflow/tfjs-core': '@tensorflow/tfjs',
    '@tensorflow/tfjs-backend-webgl': '@tensorflow/tfjs-backend-webgl',
    '@tensorflow/tfjs-backend-cpu': '@tensorflow/tfjs-backend-cpu'
  };

  // Add module rules for TensorFlow.js
  config.module.rules.push({
    test: /\.wasm$/,
    type: 'webassembly/async'
  });

  config.experiments = {
    ...config.experiments,
    asyncWebAssembly: true
  };

  return config;
}