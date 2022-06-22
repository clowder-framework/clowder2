import React from "react";
import {Box, Typography} from "@mui/material";
import {parseDate} from "../../utils/common";
import {FileOut} from "../../openapi/v2";


type FileAboutProps = {
	fileSummary: FileOut
}

export function FileAbout(props: FileAboutProps) {
	const {id, created, name, creator, version_id, bytes, content_type} = props.fileSummary;

	return (
		<Box className="infoCard">
			<Typography className="title">About</Typography>
			<Typography className="content">File ID: {id}</Typography>
			<Typography className="content">Updated on: {parseDate(created)}</Typography>
			<Typography className="content">Uploaded as: {name}</Typography>
			<Typography className="content">Uploaded by: {creator.first_name} {creator.last_name}</Typography>
			<Typography className="content">Latest Version: {version_id}</Typography>
			<Typography className="content">Size {bytes} bytes</Typography>
			<Typography className="content">Content Type: {content_type}</Typography>
		</Box>
	);
}

