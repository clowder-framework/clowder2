import React from "react";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import {Button} from "@mui/material";
import {VersionChip} from "../versions/VersionChip";
import {parseDate} from "../../utils/common";
import FileMenu from "./FileMenu";
import {theme} from "../../theme";
import prettyBytes from 'pretty-bytes';

const iconStyle = {
	"vertical-align": "middle",
	color: theme.palette.primary.main
}

export function FilesTableFileEntry(props) {

	const {selectFile, file, key} = props;

	return (
		<TableRow
			key={key}
			sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
		>
			<TableCell component="th" scope="row" key={`${file.id}-icon`}>
				<InsertDriveFileIcon sx={iconStyle}/>
				<Button onClick={() => selectFile(file.id)}>{file.name}</Button>
				{/*TODO this should be version number; for now put version ID instead*/}
				<VersionChip versionNumber={file.version_num}/>
			</TableCell>
			<TableCell align="right">{parseDate(file.created)} by {file.creator.first_name} {file.creator.last_name}</TableCell>
			<TableCell align="right">{prettyBytes(file.bytes)}</TableCell>
			<TableCell align="right">{file.content_type}</TableCell>
			<TableCell align="right"><FileMenu file={file}/></TableCell>
		</TableRow>
	)
}
