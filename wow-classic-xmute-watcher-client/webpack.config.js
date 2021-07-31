const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");

module.exports = {
  entry: path.join(__dirname, "src", "app.js"),
  output: { path: path.join(__dirname, "build"), filename: "[name].bundle.js" },
  mode: process.env.NODE_ENV || "development",
  resolve: {
    modules: ["node_modules"],
    alias: {
      "@components": path.join(__dirname, "src", "components"),
      "@styles": path.join(__dirname, "src", "styles"),
      "@utils": path.join(__dirname, "src", "utils"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(html)$/,
        use: ["html-loader"],
      },
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "index.html"),
      publicPath: "/static",
    }),
    new FaviconsWebpackPlugin(path.join(__dirname, "images", "favicon.png")),
  ],
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
};
