import React from "react";

type AudioProps = {
	fileId: string,
	audioSrc: string
}
export default function Audio(props:AudioProps) {
	const {fileId, audioSrc,} = props;
	return <audio controls><source id={fileId} src={audioSrc} /></audio>;
}
