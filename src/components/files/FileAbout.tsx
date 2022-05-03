import {Box, Typography} from "@mui/material";
import React from "react";
import {FileMetadata} from "../../types/data";
import {parseDate} from "../../utils/common";


type FileAboutProps = {
	fileMetadata: FileMetadata
}

export function FileAbout(props: FileAboutProps) {
	const {id, created, name, creator, version} = props.fileMetadata;

	return (
		<Box className="infoCard">
			<Typography className="title">About</Typography>
			<Typography className="content">File ID: {id}</Typography>
			{/*<Typography className="content">Type: {fileMetadata["content-type"]}</Typography>*/}
			{/*<Typography className="content">File size: {fileMetadata["size"]}</Typography>*/}
			<Typography className="content">Updated on: {parseDate(created)}</Typography>
			<Typography className="content">Uploaded as: {name}</Typography>
			<Typography className="content">Uploaded by: {creator.first_name} {creator.last_name}</Typography>
			<Typography className="content">Latest Version: {version}</Typography>
			{/*<Typography className="content">Status: {fileMetadata["status"]}</Typography>*/}
		</Box>
	);
}

