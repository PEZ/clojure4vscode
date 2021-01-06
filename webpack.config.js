const path = require('path');

const CALVA_MAIN = {
  // vscode extensions run in a Node.js-context
  // 📖 -> https://webpack.js.org/configuration/node/
  target: 'node',
  // the entry point of this extension,
  // 📖 -> https://webpack.js.org/configuration/entry-context/
  entry: {
    extension: path.resolve(__dirname, 'src/extension.ts'),
    debug: path.resolve(__dirname, 'src/debugger/calva-debug.ts')
  },
  output: {
    // the bundle is stored in the 'dist' folder (check package.json),
    // 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'out'),
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]',
  },
  devtool: 'source-map',
  externals: {
    // the vscode-module is created on-the-fly and must be excluded.
    // Add other modules that cannot be webpack'ed,
    // 📖 -> https://webpack.js.org/configuration/externals/
    vscode: 'commonjs vscode'
  },
  resolve: {
    // support reading TypeScript and JavaScript files,
    // 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  // Watch options for the webview.
  // 📖 -> https://webpack.js.org/configuration/watch/
  watchOptions: {
    aggregateTimeout: 200,
    poll: 500,
    ignored: /node_modules/
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, 'tsconfig.json')
        }
      }
    ]
  }
}

// Build the configuration based on production
// or development mode. The extension is only
// webpacked for production.
function buildConfig(isProduction) {
  const configs = [];
  if (isProduction) {
    configs.unshift(CALVA_MAIN)
  }
  //return configs
  return configs
}

// Get the mode from the argv array.
module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'
  return buildConfig(isProduction)
}
