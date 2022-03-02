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
					return (

						<List dense={true}>
							<ListItem>
								<ListItemAvatar>
									{/*TODO replace with pretty version name*/}
									<VersionChip versionNumber={fileVersion["version_id"].slice(0,2)}/>
								</ListItemAvatar>
								<ListItemText primary={`Uploaded by ${fileVersion["creator"]}`}
									secondary={`Uploaded on ${parseDate(fileVersion["created"])}`}
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
