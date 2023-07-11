import React, { lazy } from "react";

interface VisComponentDefinitions {
	name: string;
	mainType: string;
	mimeTypes: string[];
	component: JSX.Element;
}

const visComponentDefinitions: VisComponentDefinitions[] = <
	VisComponentDefinitions[]
>[];

function registerComponent(config) {
	return lazy(
		() =>
			import(
				/* webpackChunkName: "[request]" */ `./components/visualizations/${config.visConfig.name}/${config.main}`
			)
	);
}

const configAudio = require("./components/visualizations/Audio/manifest.json");
visComponentDefinitions.push({
	name: configAudio.name,
	mainType: configAudio.visConfig.mainType,
	mimeTypes: configAudio.visConfig.mimeTypes,
	component: React.createElement(registerComponent(configAudio)),
});

// const configDemo = require("./components/visualizations/Demo/manifest.json");
// visComponentDefinitions.push({
// 	name: configDemo.name,
// 	mainType: configDemo.visConfig.mainType,
// 	mimeTypes: configDemo.visConfig.mimeTypes,
// 	component: React.createElement(registerComponent(configDemo)),
// });

const configIframe = require("./components/visualizations/Iframe/manifest.json");
visComponentDefinitions.push({
	name: configIframe.name,
	mainType: configIframe.visConfig.mainType,
	mimeTypes: configIframe.visConfig.mimeTypes,
	component: React.createElement(registerComponent(configIframe)),
});

const configImage = require("./components/visualizations/Image/manifest.json");
visComponentDefinitions.push({
	name: configImage.name,
	mainType: configImage.visConfig.mainType,
	mimeTypes: configImage.visConfig.mimeTypes,
	component: React.createElement(registerComponent(configImage)),
});

const configText = require("./components/visualizations/Text/manifest.json");
visComponentDefinitions.push({
	name: configText.name,
	mainType: configText.visConfig.mainType,
	mimeTypes: configText.visConfig.mimeTypes,
	component: React.createElement(registerComponent(configText)),
});

const configVideo = require("./components/visualizations/Video/manifest.json");
visComponentDefinitions.push({
	name: configVideo.name,
	mainType: configVideo.visConfig.mainType,
	mimeTypes: configVideo.visConfig.mimeTypes,
	component: React.createElement(registerComponent(configVideo)),
});

export { visComponentDefinitions };
