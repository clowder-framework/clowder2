import React, { lazy } from "react";

interface VizComponentDefinitions {
	name: string;
	mainType: string;
	mimeTypes: string[];
	component: JSX.Element;
}

const vizComponentDefinitions: VizComponentDefinitions[] = <
	VizComponentDefinitions[]
>[];

function registerComponent(config) {
	return lazy(
		() =>
			import(
				/* webpackChunkName: "[request]" */ `./components/visualizations/${config.vizConfig.name}/${config.main}`
			)
	);
}

const configAudio = require("./components/visualizations/Audio/manifest.json");
vizComponentDefinitions.push({
	name: configAudio.name,
	mainType: configAudio.vizConfig.mainType,
	mimeTypes: configAudio.vizConfig.mimeTypes,
	component: React.createElement(registerComponent(configAudio)),
});

const configDemo = require("./components/visualizations/Demo/manifest.json");
vizComponentDefinitions.push({
	name: configDemo.name,
	mainType: configDemo.vizConfig.mainType,
	mimeTypes: configDemo.vizConfig.mimeTypes,
	component: React.createElement(registerComponent(configDemo)),
});

const configHtml = require("./components/visualizations/Html/manifest.json");
vizComponentDefinitions.push({
	name: configHtml.name,
	mainType: configHtml.vizConfig.mainType,
	mimeTypes: configHtml.vizConfig.mimeTypes,
	component: React.createElement(registerComponent(configHtml)),
});

const configImage = require("./components/visualizations/Image/manifest.json");
vizComponentDefinitions.push({
	name: configImage.name,
	mainType: configImage.vizConfig.mainType,
	mimeTypes: configImage.vizConfig.mimeTypes,
	component: React.createElement(registerComponent(configImage)),
});

const configText = require("./components/visualizations/Text/manifest.json");
vizComponentDefinitions.push({
	name: configText.name,
	mainType: configText.vizConfig.mainType,
	mimeTypes: configText.vizConfig.mimeTypes,
	component: React.createElement(registerComponent(configText)),
});

const configVideo = require("./components/visualizations/Video/manifest.json");
vizComponentDefinitions.push({
	name: configVideo.name,
	mainType: configVideo.vizConfig.mainType,
	mimeTypes: configVideo.vizConfig.mimeTypes,
	component: React.createElement(registerComponent(configVideo)),
});

export { vizComponentDefinitions };
