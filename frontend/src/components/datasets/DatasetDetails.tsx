import React from "react";
import { Box, Typography } from "@mui/material";
import { parseDate } from "../../utils/common";
import { StackedList } from "../util/StackedList";
import { Dataset } from "../../types/data";

type DatasetAboutProps = {
	details: Dataset;
};

export function DatasetDetails(props: DatasetAboutProps) {
	const { id, created, modified, creator, status, views, downloads} =
		props.details;

	const details = new Map<string, string>();
	details.set("Owner", `${creator.first_name} ${creator.last_name}`);
	details.set("Created on", parseDate(created));
	details.set("Updated on", parseDate(modified));
	details.set("Status", status);
	details.set("Dataset id", id);
	details.set("Downloads", downloads);

	return (
		<Box sx={{ mt: 5 }}>
			<Typography variant="h5" gutterBottom>
				Details
			</Typography>
			<StackedList keyValues={details} />
		</Box>
	);
}
