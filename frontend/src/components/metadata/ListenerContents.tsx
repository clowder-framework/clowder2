import React from "react";
import ReactJson from "react-json-view";

type ListenerContentEntry = {
	content: any;
};

export const ListenerContents = (props: ListenerContentEntry) => {
	const { content } = props;
	// @ts-ignore
	return (
		<ReactJson
			src={content}
			theme="summerfruit:inverted"
			displayObjectSize={false}
			displayDataTypes={false}
			name={false}
		/>
	);
};
