import React, { lazy } from "react";

const Image = lazy(
	() => import(/* webpackChunkName: "previewers-image" */ "../previewers/Image")
);
const Audio = lazy(
	() => import(/* webpackChunkName: "previewers-audio" */ "../previewers/Audio")
);
const Video = lazy(
	() => import(/* webpackChunkName: "previewers-video" */ "../previewers/Video")
);

const Iframe = lazy(
	() =>
		import(/* webpackChunkName: "previewers-iframe" */ "../previewers/Iframe")
);

const Text = lazy(
	() => import(/* webpackChunkName: "previewers-text" */ "../previewers/Text")
);

export const vizConfig = {
	image: <Image />,
	audio: <Audio />,
	video: <Video />,
	text: <Text />,
	NA: <Text />,
};
