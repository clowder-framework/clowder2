import React from "react";
import { Box, Typography } from "@mui/material";
import { parseDate } from "../../utils/common";
import { FileOut } from "../../openapi/v2";
import prettyBytes from "pretty-bytes";
import { StackedList } from "../util/StackedList";

type FileAboutProps = {
	fileSummary: FileOut;
};

export function FileDetails(props: FileAboutProps) {
	const {
		id,
		created,
		name,
		creator,
		version_id,
		bytes,
		content_type,
		views,
		downloads,
	} = props.fileSummary;

	const details = new Map<string, string>();
	details.set("Size", prettyBytes(bytes));
	details.set("Content type", content_type.content_type);
	details.set("Updated on", parseDate(created));
	details.set("Uploaded as", name);
	details.set("Uploaded by", `${creator.first_name} ${creator.last_name}`);
	details.set("File id", id);
	details.set("Downloads", downloads);

	return (
		<Box sx={{ mt: 5, mb: 2 }}>
			<Typography variant="h5" gutterBottom>
				Details
			</Typography>
			<StackedList keyValues={details} />
		</Box>
	);
}
