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
		storage_type,
		storage_path,
	} = props.fileSummary;

	const details = new Map<string, string>();
	details.set("Size", prettyBytes(bytes));
	details.set("Content type", content_type.content_type);
	details.set("Updated on", parseDate(created));
	details.set("Uploaded as", name);
	details.set("Uploaded by", `${creator.first_name} ${creator.last_name}`);
	switch (storage_type) {
		case "minio": {
			details.set("Storage location", "Database");
			break;
		}
		case "local": {
			details.set("Storage location", "Local file system");
			break;
		}
		case "remote": {
			details.set("Storage location", "Remote URL");
			break;
		}
		default: {
			details.set("Storage location", `${storage_type}`);
			break;
		}
	}
	details.set("File id", id);
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
