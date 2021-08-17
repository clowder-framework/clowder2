import React from "react";

export default function Video(props) {
	const {fileId, videoSrc, ...other} = props;
	return (<video width='100%' id='ourvideo' controls>
		<source id={fileId} src={videoSrc}></source>
	</video>);
}
