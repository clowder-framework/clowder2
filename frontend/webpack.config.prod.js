// For info about this file refer to webpack and webpack-hot-middleware documentation
// For info on how we"re generating bundles with hashed filenames for cache busting: https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95#.w99i89nsz
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import autoprefixer from "autoprefixer";
import path from "path";
import TerserPlugin from "terser-webpack-plugin";

// eslint-disable-next-line no-console
console.log(
	`the current CLOWDER_REMOTE_HOSTNAME environment variable is ${process.env.CLOWDER_REMOTE_HOSTNAME}`
);
console.log(
	`the JupyterHub URL is set to ${process.env.JUPYTERHUB_URL}`
)

export default {
	mode: "production",
	resolve: {
		modules: ["node_modules", "src"],
		extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
	},
	devtool: "source-map", // more info:https://webpack.github.io/docs/build-performance.html#sourcemaps and https://webpack.github.io/docs/configuration.html#devtool
	entry: [
		"babel-polyfill",
		"whatwg-fetch",
		path.resolve(__dirname, "src/index.tsx"),
		// "ol/ol.css",
		// "ol-layerswitcher/src/ol-layerswitcher.css",
	],
	target: "web", // necessary per https://webpack.github.io/docs/testing.html#compile-and-test
	output: {
		filename: "[name].bundle.js",
		chunkFilename: "[name].chunk.bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	plugins: [
		// NOTE: `npm run preinstall` currently runs eslint
		/*
		new ESLintPlugin({
			extensions:["ts","js","tsx","jsx"],
			exclude: ["node_modules", "dist", "build"]
		}),
		*/
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("production"),
				// if left not set, it will default to same host/port as frontend
				CLOWDER_REMOTE_HOSTNAME: JSON.stringify(
					process.env.CLOWDER_REMOTE_HOSTNAME
				),
				JUPYTERHUB_URL: JSON.stringify(process.env.JUPYTERHUB_URL),
				APIKEY: JSON.stringify(process.env.APIKEY),
				KeycloakBaseURL: JSON.stringify(process.env.KeycloakBaseURL),
			},
			__DEV__: false,
		}),

		// Generate an external css file with a hash in the filename
		new MiniCssExtractPlugin({ filename: "[name].[contenthash].css" }),

		// Generate HTML file that contains references to generated bundles. See here for how this works: https://github.com/ampedandwired/html-webpack-plugin#basic-usage
		new HtmlWebpackPlugin({
			template: "src/index.ejs",
			favicon: "./src/public/favicon.ico",
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeStyleLinkTypeAttributes: true,
				keepClosingSlash: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true,
			},
			inject: true,
			// Note that you can add custom options here if you need to handle other custom logic in index.html
			// To track JavaScript errors via TrackJS, sign up for a free trial at TrackJS.com and enter your token below.
			trackJSToken: "",
		}),

		new webpack.LoaderOptionsPlugin({
			debug: true,
			options: {
				sassLoader: {
					includePaths: [path.resolve(__dirname, "src", "scss")],
				},
				context: "/",
				postcss: [autoprefixer()],
			},
		}),
	],
	module: {
		rules: [
			{
				test: /\.[tj]sx?$/,
				exclude: /node_modules/,
				loader: "babel-loader",
			},
			{
				test: /\.eot(\?v=\d+.\d+.\d+)?$/,
				type: "asset/inline",
			},
			{
				test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				type: "asset/inline",
			},
			{
				test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/,
				type: "asset/inline",
			},
			{
				test: /\.svg(\?v=\d+.\d+.\d+)?$/,
				type: "asset/inline",
			},
			{
				test: /\.(jpe?g|png|gif)$/i,
				type: "asset/resource",
			},
			{
				test: /\.ico$/,
				type: "asset/resource",
			},
			{
				test: /(\.css|\.scss)$/,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
					{
						loader: "postcss-loader",
						options: {
							postcssOptions: {
								plugins: ["autoprefixer"],
							},
						},
					},
					"sass-loader",
				],
			},
			// {
			// 	test: /\.json$/,
			// 	loader: "json-loader"
			// }
		],
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					ecma: 8,
					compress: {
						warnings: false,
					},
				},
			}),
		],
		splitChunks: {
			cacheGroups: {
				reactVendor: {
					test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
					name: "vendor-react",
					chunks: "all",
				},
				corejsVendor: {
					test: /[\\/]node_modules[\\/](core-js)[\\/]/,
					name: "vendor-corejs",
					chunks: "all",
				},
				vegaVendor: {
					test: /[\\/]node_modules[\\/](.*vega.*)[\\/]/,
					name: "vendor-vega",
					chunks: "all",
				},
			},
		},
	},
};
