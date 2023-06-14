import React, { lazy } from "react";

const Image = lazy(
	() =>
		import(
			/* webpackChunkName: "previewers-image" */ "./components/previewers/image/Image"
		)
);
const Audio = lazy(
	() =>
		import(
			/* webpackChunkName: "previewers-audio" */ "./components/previewers/audio/Audio"
		)
);
const Video = lazy(
	() =>
		import(
			/* webpackChunkName: "previewers-video" */ "./components/previewers/video/Video"
		)
);

const Text = lazy(
	() =>
		import(
			/* webpackChunkName: "previewers-text" */ "./components/previewers/text/Text"
		)
);

export const vizConfig = {
	image: <Image />,
	audio: <Audio />,
	video: <Video />,
	text: <Text />,
	NA: <Text />,
};
