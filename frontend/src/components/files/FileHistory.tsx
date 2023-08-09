import React from "react";
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
	fileVersions:FileVersion[]
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
		fileVersions,
	} = props;



	const details = new Map<string, string>();
	console.log('current verison is', current_version)
	const file = useSelector((state: RootState) => state.file);
		fileVersions.map((fileVersion, idx) => {
		console.log(fileVersion.version_num, 'this version');
		if (fileVersion.version_num == current_version){
			console.log("matching vesion num")
			if (fileVersion.bytes !== undefined){
				details.set("Size", prettyBytes(fileVersion.bytes));
			}
			if (content_type.content_type != null) {
				details.set("Content type", content_type.content_type);
			}
			details.set("Updated on", parseDate(fileVersion.created));
			details.set("Uploaded as", name);
			details.set("Uploaded by", `${fileVersion.creator.first_name} ${fileVersion.creator.last_name}`);
			details.set("File id", id);
			// TODO this should be previous downloads
			details.set("Downloads", `${downloads}`);
		}
	});

	return (
		<Box sx={{ mt: 5 }}>
			<Typography variant="h5" gutterBottom>
				History
			</Typography>
			<StackedList keyValues={details} />
		</Box>
	);
}
