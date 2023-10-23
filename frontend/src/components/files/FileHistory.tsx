import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { parseDate } from "../../utils/common";
import { FileVersion } from "../../openapi/v2";
import prettyBytes from "pretty-bytes";
import { StackedList } from "../util/StackedList";
import { useSelector } from "react-redux";
import { RootState } from "../../types/data";

type FileHistoryAboutProps = {
	name?: string;
	selectedVersionNum?: number;
	contentType?: string;
};

export function FileHistory(props: FileHistoryAboutProps) {
	const { name, selectedVersionNum, contentType } = props;

	const fileVersions = useSelector(
		(state: RootState) => state.file.fileVersions
	);
	const [selectedFileVersionDetail, setSelectedFileVersionDetail] = useState(
		fileVersions[0]
	);

	useEffect(() => {
		if (
			selectedVersionNum !== undefined &&
			selectedVersionNum !== null &&
			fileVersions !== undefined &&
			fileVersions !== null &&
			fileVersions.length > 0
		) {
			fileVersions.map((fileVersion: FileVersion) => {
				if (fileVersion.version_num == selectedVersionNum) {
					setSelectedFileVersionDetail(fileVersion);
				}
			});
		}
	}, [selectedVersionNum]);

	const details = new Map<string, string>();
	if (
		selectedFileVersionDetail !== null &&
		selectedFileVersionDetail !== undefined
	) {
		details.set(
			"Size",
			selectedFileVersionDetail.bytes
				? prettyBytes(selectedFileVersionDetail.bytes)
				: "NA"
		);
		details.set("Content type", contentType ?? "NA");
		details.set("Updated on", parseDate(selectedFileVersionDetail.created));
		details.set("Uploaded as", name ?? "NA");
		details.set(
			"Uploaded by",
			`${selectedFileVersionDetail.creator.first_name} ${selectedFileVersionDetail.creator.last_name}`
		);
		details.set("File id", selectedFileVersionDetail.file_id);
	}

	return (
		<Box sx={{ mt: 5 }}>
			<Typography variant="h5" gutterBottom>
				History
			</Typography>
			<StackedList keyValues={details} />
		</Box>
	);
}
