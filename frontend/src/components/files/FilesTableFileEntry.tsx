import React, { useEffect, useState } from "react";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { Button } from "@mui/material";
import { VersionChip } from "../versions/VersionChip";
import { parseDate } from "../../utils/common";
import FileMenu from "./FileMenu";
import prettyBytes from "pretty-bytes";
import { FileOut } from "../../openapi/v2";
import {
	generatePublicThumbnailUrl,
	generateThumbnailUrl,
} from "../../utils/visualization";

type FilesTableFileEntryProps = {
	iconStyle: {};
	selectFile: any;
	file: FileOut;
	parentFolderId: any;
	publicView: boolean | false;
};

export function FilesTableFileEntry(props: FilesTableFileEntryProps) {
	const { iconStyle, selectFile, file, parentFolderId, publicView } = props;
	const [thumbnailUrl, setThumbnailUrl] = useState("");
	const [selectedVersion, setSelectedVersion] = useState(file.version_num);

	useEffect(() => {
		let url = "";
		if (file.thumbnail_id) {
			if (publicView) {
				url = generatePublicThumbnailUrl(file.thumbnail_id);
			} else {
				url = generateThumbnailUrl(file.thumbnail_id);
			}
		}
		setThumbnailUrl(url);
	}, [file]);

	return (
		<>
			{file.folder_id === parentFolderId ? (
				<TableRow
					key={file.id}
					sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
				>
					<TableCell component="th" scope="row" key={`${file.id}-icon`}>
						{file.thumbnail_id ? (
							<img
								src={thumbnailUrl}
								alt="thumbnail"
								width="24"
								height="24"
								style={{ verticalAlign: "middle" }}
							/>
						) : (
							<InsertDriveFileIcon sx={iconStyle} />
						)}
						<Button onClick={() => selectFile(file.id)}>{file.name}</Button>
					</TableCell>
					<TableCell align="right">{parseDate(file.created)}</TableCell>
					<TableCell align="right">
						{file.bytes ? prettyBytes(file.bytes) : "NA"}
					</TableCell>
					<TableCell align="right">
						{file.content_type ? file.content_type.content_type : "NA"}
					</TableCell>
					<TableCell align="right">
						<FileMenu
							file={file}
							setSelectedVersion={setSelectedVersion}
							publicView={publicView}
						/>
					</TableCell>
				</TableRow>
			) : (
				<></>
			)}
		</>
	);
}
