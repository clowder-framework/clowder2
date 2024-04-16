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

	const details = new Map<
		string,
		{ value: string | undefined; info?: string }
	>();

	if (
		selectedFileVersionDetail !== null &&
		selectedFileVersionDetail !== undefined
	) {
		details.set("Size", {
			value: selectedFileVersionDetail.bytes
				? prettyBytes(selectedFileVersionDetail.bytes)
				: "NA",
		});
		details.set("Content type", { value: contentType ?? "NA" });
		details.set("Updated on", {
			value: parseDate(selectedFileVersionDetail.created),
			info: "Latest date and time of the file being updated",
		});
		details.set("Uploaded as", {
			value: name ?? "NA",
			info: "Name of the file",
		});
		details.set("Uploaded by", {
			value: `${selectedFileVersionDetail.creator.first_name} ${selectedFileVersionDetail.creator.last_name}`,
		});
		details.set("File id", { value: selectedFileVersionDetail.file_id });
	}

	return (
		<Box sx={{ mt: 5, mb: 2 }}>
			<Typography variant="h5" gutterBottom>
				Details
			</Typography>
			<StackedList keyValues={details} />
		</Box>
	);
}
