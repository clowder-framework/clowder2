import React from "react";
import {Box, Typography} from "@mui/material";
import {theme} from "../../theme";
import {parseDate} from "../../utils/common";

const textStyle = {
	fontWeight: "normal",
	fontSize: "16x",
	color: theme.palette.primary,
};

type ListenerContentEntry = {
	content: any,
}



export const ListenerContents = (props: ListenerContentEntry) => {
	const {content} = props;

	return <div><pre>{JSON.stringify(content, null, 2)}</pre></div>
}
