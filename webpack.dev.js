/* eslint-disable @typescript-eslint/no-var-requires */

const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const { stylePaths } = require("./stylePaths");
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || "9000";

module.exports = merge(common("development"), {
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    host: HOST,
    port: PORT,
    historyApiFallback: true,
    open: true,
    client: {
      // for some reason the overlay crashes when switching to/from fullscreen
      overlay: false,
    },
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [...stylePaths],
        use: ["style-loader", "css-loader"],
      },
    ],
  },
});
