const path = require('path');
const Dotenv = require('dotenv-webpack');
// const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  plugins: [
    new Dotenv(),
    // new NodePolyfillPlugin(),
  ],
  entry: {
    main: "./src/index.ts",
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: "[name]-bundle.js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    fallback: {
      //   "http": require.resolve("stream-http")
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  }
};