import React from "react";
import { Box, Typography } from "@mui/material";
import { parseDate } from "../../utils/common";
import { StackedList } from "../util/StackedList";
import { DatasetOut as Dataset } from "../../openapi/v2";

type DatasetAboutProps = {
	myRole?: string;
	details: Dataset;
};

export function DatasetDetails(props: DatasetAboutProps) {
	const { myRole } = props;
	const { id, created, modified, creator, status, downloads } = props.details;

	const details = new Map<
		string,
		{ value: string | undefined; info?: string }
	>();
	details.set("Owner", { value: `${creator.first_name} ${creator.last_name}` });
	details.set("Created", {
		value: parseDate(created),
		info: "Date and time of dataset creation",
	});
	details.set("Updated", {
		value: parseDate(modified),
		info: "Date and time of dataset modification",
	});
	details.set("Status", { value: status, info: "Public or private dataset" });
	details.set("Dataset identifier", { value: id });
	details.set("Downloads", {
		value: downloads,
		info: "Number of downloads",
	});

	if (myRole)
		details.set("My role", {
			value: myRole ? myRole.toUpperCase() : "",
			info: "Your role on the dataset. E.g. Owner, Editor, Uploader, Viewer.",
		});

	return (
		<Box sx={{ mt: 5, mb: 2 }}>
			<Typography variant="h5" gutterBottom>
				Details
			</Typography>
			<StackedList keyValues={details} />
		</Box>
	);
}
