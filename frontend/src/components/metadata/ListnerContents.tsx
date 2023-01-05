import React from "react";
import {Box, Typography} from "@mui/material";
import {theme} from "../../theme";
import {parseDate} from "../../utils/common";

const textStyle = {
	fontWeight: "normal",
	fontSize: "10px",
	fontStyle: "italic",
	color: theme.palette.secondary.light,
};


export const ListenerContents = (props) => {
	const {contents} = props;
	console.log(contents, 'are the contents')
	console.log(typeof(contents));
	return Object.entries(contents).map(([key, value]) => {
		let entry = key + ": " +value
		return <li>{entry}</li>
	});
}
