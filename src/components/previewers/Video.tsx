import React from "react";

type VideoProps = {
	fileId: string,
	videoSrc: string,
}

export default function Video(props: VideoProps) {
	const {fileId, videoSrc,} = props;
	return (<video width="100%" id="ourvideo" controls>
		<source id={fileId} src={videoSrc} />
	</video>);
}
