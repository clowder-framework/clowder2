import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import autoprefixer from "autoprefixer";
import path from "path";
import ESLintPlugin from "eslint-webpack-plugin";


// eslint-disable-next-line no-console
console.log(`the current CLOWDER_REMOTE_HOSTNAME environment variable is ${  process.env.CLOWDER_REMOTE_HOSTNAME}`);

export default {
	mode:"development",
	resolve: {
		modules:["node_modules", "src"],
		extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
	},
	devtool: "source-map",
	entry: [
		"babel-polyfill",
		"whatwg-fetch",
		"./src/webpack-public-path",
		"webpack-hot-middleware/client?reload=true",
		path.resolve(__dirname, "src/index.tsx"),
		// "ol/ol.css",
		// "ol-layerswitcher/src/ol-layerswitcher.css",
	],
	target: "web",
	output: {
		path: path.resolve(__dirname, "dist"),
		publicPath: "",
		filename: "bundle.js"
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env": {
				"NODE_ENV": JSON.stringify("development"),
				// if left not set, it will default to same host/port as frontend
				"CLOWDER_REMOTE_HOSTNAME": JSON.stringify(process.env.CLOWDER_REMOTE_HOSTNAME),
				"APIKEY": JSON.stringify(process.env.APIKEY),
				"KeycloakBaseURL": JSON.stringify(process.env.KeycloakBaseURL),
			},
			__DEV__: true
		}),
		new ESLintPlugin({
			extensions: ["ts","tsx","js","jsx"],
			exclude: ["node_modules", "dist", "build"]
		}),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
		new HtmlWebpackPlugin({
			template: "src/index.ejs",
			minify: {
				removeComments: true,
				collapseWhitespace: true
			},
			inject: true
		}),
		new webpack.LoaderOptionsPlugin({
			debug: true,
			options: {
				sassLoader: {
					includePaths: [path.resolve(__dirname, "src", "scss")]
				},
				context: "/",
				postcss: [
					autoprefixer(),
				]
			}
		})
	],
	module: {
		rules: [
			{test: /\.[tj]sx?$/, exclude: /node_modules/, loaders: ["babel-loader"]},
			{test: /\.eot(\?v=\d+.\d+.\d+)?$/, loader: "file-loader"},
			{
				test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: "url-loader?limit=10000&mimetype=application/font-woff"
			},
			{test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/, loader: "url-loader?limit=10000&mimetype=application/octet-stream"},
			{test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=image/svg+xml"},
			{test: /\.(jpe?g|png|gif)$/i, loader: "file-loader?name=[name].[ext]"},
			{test: /\.ico$/, loader: "file-loader?name=[name].[ext]"},
			{test: /\.html$/i, loader: "html-loader"},
			{
				test: /(\.css|\.scss)$/,
				use:[
					{ loader: "style-loader"},
					{ loader: "css-loader", options: { sourceMap: true } },
					{ loader: "postcss-loader", options: { plugins: () => [require("autoprefixer")] } },
					{ loader: "sass-loader", options: { sourceMap: true } }
				]
			},
			// {test: /\.json$/, loader: "json-loader"}
		]
	},
};
