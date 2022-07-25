import React from "react";
import {Box, List, ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import {VersionChip} from "./VersionChip";
import {parseDate} from "../../utils/common";
import {FileVersion} from "../../openapi/v2";

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
					const {version_num, creator, created} = fileVersion;
					return (

						<List dense={true}>
							<ListItem>
								<ListItemAvatar>
									{/*TODO replace with pretty version name*/}
									<VersionChip versionNumber={version_num}/>
								</ListItemAvatar>
								<ListItemText
									primary={`Uploaded by ${creator != null?
										`${creator.first_name} ${creator.last_name}` : ""}`}
									secondary={`Uploaded on ${parseDate(created)}`}
								/>
								{/*TODO implement those actions*/}
								{/*<Button disabled>Download</Button>*/}
								{/*<Button disabled>Delete</Button>*/}
								{/*<Button disabled>Make Current</Button>*/}
							</ListItem>
						</List>
					);
				})
			}
		</Box>
	);
}
