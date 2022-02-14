import {Box, Typography} from "@mui/material";
import React from "react";
import {FileMetadata} from "../../types/data";

type FileStatsProps = {
	fileMetadata: FileMetadata
}

export function FileStats(props: FileStatsProps) {
	const {fileMetadata} = props;

	return (
		<Box className="infoCard">
			<Typography className="title">Statistics</Typography>
			<Typography className="content">Views: {fileMetadata["views"]}</Typography>
			{/*<Typography className="content">Last viewed: Jun 07, 2021 21:49:09</Typography>*/}
			<Typography className="content">Downloads: {fileMetadata["downloads"]}</Typography>
			{/*<Typography className="content">Last downloaded: Never</Typography>*/}
		</Box>
	);
}
