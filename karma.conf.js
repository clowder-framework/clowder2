let path = require("path");

process.env.NODE_ENV = "test";

module.exports = function (config) {
	config.set({
		browsers: ["Chrome", "Firefox", "ChromeHeadless"],
		singleRun: true,
		colors: true,
		basePath: "",
		frameworks: ["jasmine", "sinon"],
		preprocessors: {
			"test/**/*.test.js": ["webpack", "sourcemap"],
			"test/**/*.test.jsx": ["webpack", "sourcemap"]
		},
		files: [
			"node_modules/babel-polyfill/dist/polyfill.js",
			{pattern: "test/**/*.test.js"},
			{pattern: "test/**/*.test.jsx"},
		],
		reporters: ["mocha", "coverage"], //report results in this format
		coverageReporter: {
			reporters: [
				{
					type: "text-summary"
				},
				{
					type: "html",
					dir: "coverage"
				}
			]
		},
		webpack: {
			devtool: "inline-source-map",
			resolve: {
				extensions: [".js", ".jsx"]
			},
			module: {
				exprContextCritical: false,
				rules: [
					{
						enforce: "pre",
						test: /\.js$/,
						exclude: [path.resolve("node_modules"), path.resolve("src")],
						loaders: ["babel-loader"]
					},
					{
						enforce: "pre",
						test: /\.jsx?$/,
						exclude: path.resolve("node_modules"),
						include: path.resolve("src"),
						loaders: ["isparta-loader"]
					}
				]
			},
			externals: {
				"react/addons": true,
				"react/lib/ExecutionEnvironment": true,
				"react/lib/ReactContext": true
			}
		},
		webpackServer: {
			noInfo: true
		},
		plugins: [
			"karma-webpack",
			"karma-jasmine",
			"karma-sinon",
			"karma-coverage",
			"karma-sourcemap-loader",
			"karma-chrome-launcher",
			"karma-firefox-launcher",
			"karma-phantomjs-launcher",
			"karma-mocha-reporter"
		]
	});
};
