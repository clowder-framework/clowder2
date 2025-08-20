import React from "react";
import { Box, Typography } from "@mui/material";
import { parseDate } from "../../utils/common";
import { FileOut } from "../../openapi/v2";
import prettyBytes from "pretty-bytes";
import { StackedList } from "../util/StackedList";

type FileAboutProps = {
	fileSummary: FileOut;
	myRole?: string;
};

export function FileDetails(props: FileAboutProps) {
	const { myRole } = props;
	const {
		id,
		created,
		name,
		creator,
		bytes,
		content_type,
		downloads,
		storage_type,
	} = props.fileSummary;

	const details = new Map<
		string,
		{ value: string | undefined; info?: string }
	>();
	details.set("Size", { value: prettyBytes(bytes) });
	details.set("Content type", { value: content_type.content_type });
	details.set("Updated", {
		value: parseDate(created),
		info: "Latest date and time of the file being updated",
	});
	details.set("Uploaded", { value: name, info: "Name of the file" });
	details.set("Uploader", {
		value: `${creator.first_name} ${creator.last_name}`,
	});

	switch (storage_type) {
		case "minio": {
			details.set("Storage location", {
				value: "Local object store",
				info: "Data stored in the MinIO instance",
			});
			break;
		}
		case "local": {
			details.set("Storage location", {
				value: "Local file system",
				info: "Data stored in the local file system",
			});
			break;
		}
		case "remote": {
			details.set("Storage location", {
				value: "Remote URL",
				info: "Data stored in a remote location",
			});
			break;
		}
		default: {
			details.set("Storage location", {
				value: `${storage_type}`,
				info: `Data stored in ${storage_type}`,
			});
			break;
		}
	}
	details.set("File identifier", { value: id });
	details.set("Downloads", {
		value: downloads,
		info: "Number of downloads",
	});

	if (myRole)
		details.set("My role", {
			value: myRole ? myRole.toUpperCase() : "",
			info: "Your role on the file. E.g. Owner, Editor, Uploader, Viewer.",
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
