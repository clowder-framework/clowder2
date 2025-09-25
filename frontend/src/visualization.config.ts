import React, { lazy } from "react";

export interface VisComponentDefinitions {
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

const configHtml = require("./components/visualizations/Html/manifest.json");
visComponentDefinitions.push({
	name: configHtml.name,
	mainType: configHtml.visConfig.mainType,
	mimeTypes: configHtml.visConfig.mimeTypes,
	component: React.createElement(registerComponent(configHtml)),
});

const configImage = require("./components/visualizations/Image/manifest.json");
visComponentDefinitions.push({
	name: configImage.name,
	mainType: configImage.visConfig.mainType,
	mimeTypes: configImage.visConfig.mimeTypes,
	component: React.createElement(registerComponent(configImage)),
});

const configWholeSlideImage = require("./components/visualizations/IIIF/manifest.json");
visComponentDefinitions.push({
	name: configWholeSlideImage.name,
	mainType: configWholeSlideImage.visConfig.mainType,
	mimeTypes: configWholeSlideImage.visConfig.mimeTypes,
	component: React.createElement(registerComponent(configWholeSlideImage)),
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

const configGeospatial = require("./components/visualizations/Geospatial/manifest.json");
visComponentDefinitions.push({
	name: configGeospatial.name,
	mainType: configGeospatial.visConfig.mainType,
	mimeTypes: configGeospatial.visConfig.mimeTypes,
	component: React.createElement(registerComponent(configGeospatial)),
});

const configVega = require("./components/visualizations/CSV/manifest.json");
visComponentDefinitions.push({
	name: configVega.name,
	mainType: configVega.visConfig.mainType,
	mimeTypes: configVega.visConfig.mimeTypes,
	component: React.createElement(registerComponent(configVega)),
});

const configWordCloudSpec = require("./components/visualizations/VegaSpec/manifest.json");
visComponentDefinitions.push({
	name: configWordCloudSpec.name,
	mainType: configWordCloudSpec.visConfig.mainType,
	mimeTypes: configWordCloudSpec.visConfig.mimeTypes,
	component: React.createElement(registerComponent(configWordCloudSpec)),
});

export { visComponentDefinitions };
