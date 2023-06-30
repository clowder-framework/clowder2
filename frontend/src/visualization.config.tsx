import React, { lazy } from "react";

const vizConfig = {};

function registerComponent(config) {
	return lazy(
		() =>
			import(
				/* webpackChunkName: "[request]" */ `./components/visualizations/${config.vizConfig.name}/${config.main}`
			)
	);
}

const configAudio = require("./components/visualizations/Audio/manifest.json");
vizConfig[configAudio.vizConfig.mainType] = React.createElement(
	registerComponent(configAudio)
);

const configDemo = require("./components/visualizations/Demo/manifest.json");
vizConfig[configDemo.vizConfig.mainType] = React.createElement(
	registerComponent(configDemo)
);

const configHtml = require("./components/visualizations/Html/manifest.json");
vizConfig[configHtml.vizConfig.mainType] = React.createElement(
	registerComponent(configHtml)
);

const configImage = require("./components/visualizations/Image/manifest.json");
vizConfig[configImage.vizConfig.mainType] = React.createElement(
	registerComponent(configImage)
);

const configText = require("./components/visualizations/Text/manifest.json");
vizConfig[configText.vizConfig.mainType] = React.createElement(
	registerComponent(configText)
);

const configVideo = require("./components/visualizations/Video/manifest.json");
vizConfig[configVideo.vizConfig.mainType] = React.createElement(
	registerComponent(configVideo)
);

export { vizConfig };
