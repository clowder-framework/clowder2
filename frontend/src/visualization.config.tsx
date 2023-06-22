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
const configAudio = require("./components/previewers/Audio/manifest.json");
vizConfig[configAudio.vizConfig.mainType] = React.createElement(
	registerComponent(configAudio)
);

const configDemo = require("./components/previewers/Demo/manifest.json");
vizConfig[configDemo.vizConfig.mainType] = React.createElement(
	registerComponent(configDemo)
);

const configHtml = require("./components/previewers/Html/manifest.json");
vizConfig[configHtml.vizConfig.mainType] = React.createElement(
	registerComponent(configHtml)
);

const configImage = require("./components/previewers/Image/manifest.json");
vizConfig[configImage.vizConfig.mainType] = React.createElement(
	registerComponent(configImage)
);

const configText = require("./components/previewers/Text/manifest.json");
vizConfig[configText.vizConfig.mainType] = React.createElement(
	registerComponent(configText)
);

const configVideo = require("./components/previewers/Video/manifest.json");
vizConfig[configVideo.vizConfig.mainType] = React.createElement(
	registerComponent(configVideo)
);

export { vizConfig };
