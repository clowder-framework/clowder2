import React, { lazy } from "react";

const vizConfig = {};

function registerComponent(config) {
	return lazy(
		() =>
			import(
				/* webpackChunkName: `previewers-${config.name}` */
				`./components/previewers/${config.vizConfig.name}/${config.main}`
			)
	);
}

let config;
config = require("./components/previewers/Audio/manifest.json");
vizConfig[config.vizConfig.mainType] = React.createElement(
	registerComponent(config)
);
