import React from "react";
import {Box, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText} from "@mui/material";
import {VersionChip} from "./VersionChip";
import {parseDate} from "../../utils/common";
import {FileVersion} from "../../openapi/v2";
import MenuItem from "@mui/material/MenuItem";
import DownloadIcon from '@mui/icons-material/Download';
import {fileDownloaded} from "../../actions/file";
import {useDispatch} from "react-redux";

type FileVersionHistoryProps = {
	fileVersions: FileVersion[]
}

export function FileVersionHistory(props: FileVersionHistoryProps) {
	const {fileVersions} = props;
	const dispatch = useDispatch();
	const downloadFile = (fileId:string|undefined, filename:string|undefined, fileVersion:number|undefined) => dispatch(fileDownloaded(fileId, filename, fileVersion))

	return (
		<Box className="infoCard">
			<List dense={true}>
				{
					// sort by date decending
					fileVersions.map((fileVersion) => {
						const {version_num, creator, created} = fileVersion;
						return (
							<ListItem key={version_num}>
								<ListItemAvatar>
									<VersionChip versionNumber={version_num}/>
								</ListItemAvatar>
								<ListItemText
									primary={`Uploaded by ${creator != null ?
										`${creator.first_name} ${creator.last_name}` : ""}`}
									secondary={`Uploaded on ${parseDate(created)}`}
								/>
								<MenuItem onClick={()=>{
								   downloadFile(fileVersion.file_id, fileVersion.file_name, version_num);
								}}>
								   <ListItemIcon>
									  <DownloadIcon fontSize="small" />
								   </ListItemIcon>
								   <ListItemText>Download</ListItemText>
								</MenuItem>
								{/*TODO implement those actions*/}
								{/*<Button disabled>Download</Button>*/}
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
