import React from "react";
import { Box, Typography } from "@mui/material";
import { parseDate } from "../../utils/common";
import {ContentType, FileOut, UserOut} from "../../openapi/v2";
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
	} = props;

	const details = new Map<string, string>();
	const file = useSelector((state: RootState) => state.file);
	console.log('in fileHistory the file is', file);
	if (bytes !== undefined) {
			details.set("Size", prettyBytes(bytes));

	}
	if (fileSummary !== undefined){
		details.set("Content type", `${content_type.content_type}`);
	}
	details.set("Updated on", parseDate(created));
	if (name !== undefined) {
		details.set("Uploaded as", name);
	}
	details.set("Uploaded by", `${creator.first_name} ${creator.last_name}`);
	if (id !== undefined) {
		details.set("File id", id);

	}
	if (downloads !== undefined) {
		details.set("Downloads", "downloads goes here");
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
