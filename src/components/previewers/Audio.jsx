import React from "react";

export default function Audio(props) {
	const {fileId, audioSrc, ...other} = props;
	return <audio controls><source id={fileId} src={audioSrc} /></audio>
}
