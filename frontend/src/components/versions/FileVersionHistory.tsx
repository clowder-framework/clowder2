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
import config from "../../app.config";

type FileVersionHistoryProps = {
	fileVersions: FileVersion[];
	publicView: boolean | false;
};

export function FileVersionHistory(props: FileVersionHistoryProps) {
	const { fileVersions, publicView } = props;

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
									<VersionChip selectedVersion={version_num} />
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
								{publicView ? (
									<Button
										href={`${config.hostname}/api/v2/public_files/${fileVersion.file_id}?version=${version_num}`}
										variant="contained"
									>
										Download
									</Button>
								) : (
									<Button
										href={`${config.hostname}/api/v2/files/${fileVersion.file_id}?version=${version_num}`}
										variant="contained"
									>
										Download
									</Button>
								)}

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
