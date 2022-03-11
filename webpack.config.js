//webpack.config.js
var path = require('path');

module.exports = {
  mode: "development",
  entry: {
    main: "./src/scripts/js/main"
  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".js"]
  },
  output: {
    publicPath: "/dist/scripts/",
    path: path.join(__dirname, "/dist/scripts/"),
    filename: '[name].build.js'
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre"
      }
    ]
  }
};