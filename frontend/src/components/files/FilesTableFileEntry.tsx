import React from "react";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import {Button} from "@mui/material";
import {VersionChip} from "../versions/VersionChip";
import {parseDate} from "../../utils/common";
import FileMenu from "./FileMenu";
import {theme} from "../../theme";

const iconStyle = {
	"vertical-align": "middle",
	color: theme.palette.primary.main
}

export function FilesTableFileEntry(props) {

	const {selectFile, file,} = props;

	return (
		<TableRow
			key={file.id}
			sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
		>
			<TableCell component="th" scope="row">
				<InsertDriveFileIcon sx={iconStyle}/>
				<Button onClick={() => selectFile(file.id)}>{file.name}</Button>
				<VersionChip versionNumber={file.version_num}/>
			</TableCell>
			{
				file.creator.first_name && file.creator.last_name ?
					<TableCell align="right">{parseDate(file.created)} by {file.creator.first_name} {file.creator.last_name}</TableCell>
					:
					<TableCell align="right">{parseDate(file.created)} by {file.creator}</TableCell>
			}
			<TableCell align="right">{file.bytes} bytes</TableCell>
			<TableCell align="right">{file.content_type}</TableCell>
			<TableCell align="right"><FileMenu file={file}/></TableCell>
		</TableRow>
	)
}
