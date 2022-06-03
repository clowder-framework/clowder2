import React from "react";
import {Box, Typography} from "@mui/material";
import {FileOut} from "../../openapi/v2";

type FileStatsProps = {
	fileSummary: FileOut
}

export function FileStats(props: FileStatsProps) {
	const {fileSummary} = props;

	return (
		<Box className="infoCard">
			<Typography className="title">Statistics</Typography>
			<Typography className="content">Views: {fileSummary["views"]}</Typography>
			<Typography className="content">Downloads: {fileSummary["downloads"]}</Typography>
		</Box>
	);
}
