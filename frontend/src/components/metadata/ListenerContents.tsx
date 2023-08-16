import React from "react";
import ReactJson from "react-json-view";

type ListenerContentEntry = {
	content: any;
};

export const ListenerContents = (props: ListenerContentEntry) => {
	const { content } = props;

	// return <div><pre>{JSON.stringify(content, null, 2)}</pre></div>
	return <ReactJson src={content} />;
};
