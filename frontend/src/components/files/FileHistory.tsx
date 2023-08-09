import React, {useEffect, useState} from "react";
import { Box, Typography } from "@mui/material";
import { parseDate } from "../../utils/common";
import {ContentType, FileOut, FileVersion, UserOut} from "../../openapi/v2";
import prettyBytes from "pretty-bytes";
import { StackedList } from "../util/StackedList";
import {useSelector} from "react-redux";
import {RootState} from "../../types/data";

type FileHistoryAboutProps = {
	id: string;
	created:any;
	name:string;
	creator:UserOut;
	version_id:string;
	bytes:number;
	content_type:ContentType;
	views:number;
	downloads:number;
	current_version:number|undefined;
	fileSummary:FileOut;
	selectedFileVersion:FileVersion
};

export function FileHistory(props: FileHistoryAboutProps) {
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
		current_version,
		fileSummary,
		selectedFileVersion,
	} = props;

	console.log('the selected file version is', selectedFileVersion);

	const details = new Map<string, string>();
	details.set("Size", prettyBytes(bytes));
	details.set("Content type", content_type.content_type);
	details.set("Updated on", parseDate(created));
	details.set("Uploaded as", name);
	details.set("Uploaded by", `${creator.first_name} ${creator.last_name}`);
	details.set("File id", id);
	details.set("Downloads", downloads);

	return (
		<Box sx={{ mt: 5 }}>
			<Typography variant="h5" gutterBottom>
				History
			</Typography>
			<StackedList keyValues={details} />
		</Box>
	);
}
