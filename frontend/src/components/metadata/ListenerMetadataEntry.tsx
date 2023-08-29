import React from "react";
import { Box } from "@mui/material";
import { ListenerAgent } from "./ListenerAgent";
import { ListenerContents } from "./ListenerContents";

type ListenerMetadata = {
	agent: any;
	content: any;
	context: any;
	context_url: any;
	created: string;
};

/*
This is the interface displayed already created metadata and allow eidts
Uses only the list of metadata
*/
export const ListenerMetadataEntry = (props: ListenerMetadata) => {
	const { agent, content, created } = props;

	return (
		<>
			<ListenerAgent created={created} agent={agent} />
			<Box sx={{ padding: "1em" }}>
				<ListenerContents content={content} />
			</Box>
		</>
	);
};
