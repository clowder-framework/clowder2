import React from "react";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import {Button} from "@mui/material";
import {VersionChip} from "../versions/VersionChip";
import {parseDate} from "../../utils/common";
import FileMenu from "./FileMenu";
import prettyBytes from 'pretty-bytes';
import { FileOut } from "../../openapi/v2";


type FilesTableFileEntryProps = {
	iconStyle: {}
	selectFile: any
	file:FileOut
}

export function FilesTableFileEntry(props: FilesTableFileEntryProps) {

	const {iconStyle, selectFile, file} = props;

	return (
		<TableRow
			key={file.id}
			sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
		>
			<TableCell component="th" scope="row" key={`${file.id}-icon`}>
				<InsertDriveFileIcon sx={iconStyle}/>
				<Button onClick={() => selectFile(file.id)}>{file.name}</Button>
				<VersionChip versionNumber={file.version_num}/>
			</TableCell>
			<TableCell align="right">{parseDate(file.created)} by {file.creator.first_name} {file.creator.last_name}</TableCell>
			<TableCell align="right">{file.bytes? prettyBytes(file.bytes):"NA"}</TableCell>
			<TableCell align="right">{file.content_type? file.content_type.content_type: "NA"}</TableCell>
			<TableCell align="right"><FileMenu file={file}/></TableCell>
		</TableRow>
	)
}
