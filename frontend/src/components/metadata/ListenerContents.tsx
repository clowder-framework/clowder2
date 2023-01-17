import React from "react";
import {Box, Typography} from "@mui/material";
import {theme} from "../../theme";
import {parseDate} from "../../utils/common";

const textStyle = {
	fontWeight: "normal",
	fontSize: "16x",
	color: theme.palette.primary,
};

type ListenerContentsEntry = {
	contents: any,
}



export const ListenerContents = (props: ListenerContentsEntry) => {
	const {contents} = props;

	return <div><pre>{JSON.stringify(contents, null, 2)}</pre></div>
}
