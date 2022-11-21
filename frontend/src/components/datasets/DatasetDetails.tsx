import React from "react";
import {Box, Typography} from "@mui/material";
import {parseDate} from "../../utils/common";
import prettyBytes from "pretty-bytes";
import {StackedList} from "../util/StackedList";
import {Dataset} from "../../types/data";


type DatasetAboutProps = {
	details: Dataset

}

export function DatasetDetails(props: DatasetAboutProps) {
	const {id, created, modified, author, status, views, downloads} = props.details;

	const details = new Map<string, string>();
	details.set("Owner", author.first_name + " " + author.last_name);
	details.set("Created on", parseDate(created));
	details.set("Updated on", parseDate(modified));
	details.set("Status", status);
	details.set("Dataset id", id);

	const stats = new Map<string, string>();
	stats.set("Downloads", downloads);

	return (
		<Box>
			<Box sx={{mt: 5}}>
				<Typography variant="h5" gutterBottom>Details</Typography>
				<StackedList keyValues={details}/>
			</Box>
			<Box sx={{mt: 5}}>
				<Typography variant="h5" gutterBottom>Statistics</Typography>
				<StackedList keyValues={stats}/>
			</Box>
		</Box>
	)
}

