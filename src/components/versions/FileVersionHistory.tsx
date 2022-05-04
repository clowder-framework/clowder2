import React from "react";
import {Box, Button, List, ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import {FileVersion} from "../../types/data";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {VersionChip} from "./VersionChip";
import {parseDate} from "../../utils/common";

type FileVersionHistoryProps = {
	fileVersions: FileVersion[]
}

export function FileVersionHistory(props: FileVersionHistoryProps) {
	const {fileVersions} = props;

	return (
		<Box className="infoCard">
			{
				// sort by date decending
				fileVersions.map((fileVersion) => {
					const {version_id, creator, created} = fileVersion;
					return (

						<List dense={true}>
							<ListItem>
								<ListItemAvatar>
									{/*TODO replace with pretty version name*/}
									<VersionChip versionNumber={version_id.slice(0,2)}/>
								</ListItemAvatar>
								<ListItemText
									primary={`Uploaded by ${creator != null?
										`${creator.first_name} ${creator.last_name}` : ""}`}
									secondary={`Uploaded on ${parseDate(created)}`}
								/>
								<Button disabled>Download</Button>
								<Button disabled>Delete</Button>
								<Button disabled>Make Current</Button>
							</ListItem>
						</List>
					);
				})
			}
		</Box>
	);
}
