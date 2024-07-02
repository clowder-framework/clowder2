import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import autoprefixer from "autoprefixer";
import path from "path";
import ESLintPlugin from "eslint-webpack-plugin";

// eslint-disable-next-line no-console
console.log(
	`the current CLOWDER_REMOTE_HOSTNAME environment variable is ${process.env.CLOWDER_REMOTE_HOSTNAME}`
);
console.log(
	`the JupyterHub URL is set to ${process.env.JUPYTERHUB_URL}`
)

export default {
	mode: "development",
	resolve: {
		modules: ["node_modules", "src"],
		extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
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
		filename: "[name].bundle.js",
		chunkFilename: "[name].chunk.bundle.js",
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("development"),
				// if left not set, it will default to same host/port as frontend
				CLOWDER_REMOTE_HOSTNAME: JSON.stringify(
					process.env.CLOWDER_REMOTE_HOSTNAME
				),
				JUPYTERHUB_URL: JSON.stringify(process.env.JUPYTERHUB_URL),
				APIKEY: JSON.stringify(process.env.APIKEY),
				KeycloakBaseURL: JSON.stringify(process.env.KeycloakBaseURL),
			},
			__DEV__: true,
		}),
		new ESLintPlugin({
			extensions: ["ts", "tsx", "js", "jsx"],
			exclude: ["node_modules", "dist", "build"],
		}),
		new webpack.HotModuleReplacementPlugin(),
		new HtmlWebpackPlugin({
			template: "src/index.ejs",
			favicon: "./src/public/favicon.ico",
			minify: {
				removeComments: true,
				collapseWhitespace: true,
			},
			inject: true,
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
				test: /\.ico$/,
				type: "asset/resource",
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
				test: /(\.css|\.scss)$/i,
				use: [
					"style-loader",
					"css-loader",
					{
						loader: "postcss-loader",
						options: { postcssOptions: { plugins: ["autoprefixer"] } },
					},
					{ loader: "sass-loader", options: { sourceMap: true } },
				],
			},
			// {
			// 	test: /\.json$/,
			// 	loader: "json-loader"
			// }
		],
	},
};
