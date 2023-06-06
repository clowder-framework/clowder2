import React from "react";
import {
	Box,
	Button,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
} from "@mui/material";
import { VersionChip } from "./VersionChip";
import { parseDate } from "../../utils/common";
import { FileVersion } from "../../openapi/v2";
import { fileDownloaded } from "../../actions/file";
import { useDispatch } from "react-redux";

type FileVersionHistoryProps = {
	fileVersions: FileVersion[];
	filename: string;
};

export function FileVersionHistory(props: FileVersionHistoryProps) {
	const { fileVersions, filename } = props;
	const dispatch = useDispatch();
	const downloadFile = (
		fileId: string | undefined,
		filename: string | undefined,
		fileVersion: number | undefined
	) => dispatch(fileDownloaded(fileId, filename, fileVersion));

	return (
		<Box className="infoCard">
			<List dense={true}>
				{
					// sort by date decending
					fileVersions.map((fileVersion) => {
						const { version_num, creator, created } = fileVersion;
						return (
							<ListItem key={version_num}>
								<ListItemAvatar>
									<VersionChip versionNumber={version_num} />
								</ListItemAvatar>
								<ListItemText
									primary={`Uploaded by ${
										creator != null
											? `${creator.first_name} ${creator.last_name}`
											: ""
									}`}
									secondary={`Uploaded on ${parseDate(created)}`}
									sx={{ maxWidth: "38rem" }}
								/>
								<Button
									variant="contained"
									onClick={() => {
										downloadFile(fileVersion.file_id, filename, version_num);
									}}
								>
									Download
								</Button>
								{/*TODO implement those actions*/}
								{/*<Button disabled>Delete</Button>*/}
								{/*<Button disabled>Make Current</Button>*/}
							</ListItem>
						);
					})
				}
			</List>
		</Box>
	);
}
