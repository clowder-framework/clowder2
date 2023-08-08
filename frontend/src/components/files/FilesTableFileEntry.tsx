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
import { generateVisDataDownloadUrl } from "../../utils/visualization";

type FilesTableFileEntryProps = {
	iconStyle: {};
	selectFile: any;
	file: FileOut;
	parentFolderId: any;
};

export function FilesTableFileEntry(props: FilesTableFileEntryProps) {
	const { iconStyle, selectFile, file, parentFolderId } = props;
	const [thumbnailUrl, setThumbnailUrl] = useState("");

	useEffect(() => {
		const fetchThumbnailUrl = async () => {
			try {
				let url = "";
				if (file.thumbnail_id) {
					url = await generateVisDataDownloadUrl(file.thumbnail_id);
				}
				setThumbnailUrl(url);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchThumbnailUrl();
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
						<VersionChip versionNumber={file.version_num}
									 selectedVersion={file.version_num}
									 setSelectedVersion={null}
									 versionNumbers={null}
									 isClickable={false}
						/>
					</TableCell>
					<TableCell align="right">
						{parseDate(file.created)} by {file.creator.first_name}{" "}
						{file.creator.last_name}
					</TableCell>
					<TableCell align="right">
						{file.bytes ? prettyBytes(file.bytes) : "NA"}
					</TableCell>
					<TableCell align="right">
						{file.content_type ? file.content_type.content_type : "NA"}
					</TableCell>
					<TableCell align="right">
						<FileMenu file={file} />
					</TableCell>
				</TableRow>
			) : (
				<></>
			)}
		</>
	);
}
