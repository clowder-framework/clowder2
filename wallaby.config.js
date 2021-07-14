"use strict";
// Wallaby.js configuration

let wallabyWebpack = require("wallaby-webpack");
let path = require("path");
let fs = require("fs");

let babelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, ".babelrc")));

let wallabyPostprocessor = wallabyWebpack({
	//webpack options
	externals: {
		"react": "React",
		"cheerio": "window",
		"react/addons": true,
		"react/lib/ReactContext": true,
		"react/lib/ExecutionEnvironment": true
	},
	module: {
		loaders: [
			{test: /\.jsx?$/, include: path.join(__dirname, "src"), exclude: /node_modules/,  loaders: ["babel-loader"]},
			{test: /\.json$/, loaders: ["json-loader"]},
			{test: /(\.css|\.scss)$/, loaders: ["style-loader", "css-loader?sourceMap", "sass-loader?sourceMap"]},
			{test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader"},
			{test: /\.(woff|woff2)$/, loader: "url-loader?prefix=font/&limit=5000"},
			{test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=application/octet-stream"},
			{test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=image/svg+xml"},
		]
	},
	resolve: {
		extensions: [".js", ".jsx"]
	},
	entry: {}
});

process.env.NODE_ENV = "test";

module.exports = function (wallaby) {
	return {
		// set `load: false` to all source files and tests processed by webpack
		// (except external files),
		// as they should not be loaded in browser,
		// their wrapped versions will be loaded instead
		files: [
			{pattern: "node_modules/babel-polyfill/browser.js", instrument: false},
			{pattern: "node_modules/react/dist/react-with-addons.js", instrument: false},
			{pattern: "src/**/*.js", load: false},
			{pattern: "src/**/*.jsx", load: false}
		],

		tests: [
			{pattern: "test/**/*.test.js", load: false}
		],

		env: {
			type: "browser"
		},

		testFramework: "jasmine",

		compilers: {
			"**/*.js*": wallaby.compilers.babel(babelConfig)
		},

		postprocessor: wallabyPostprocessor,

		setup: function () {
			// required to trigger test loading
			window.__moduleBundler.loadTests();
		}
	};
};
