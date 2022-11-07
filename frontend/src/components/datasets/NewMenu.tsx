import {Box, Button, Dialog, Menu, MenuItem} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {CreateFolder} from "../folders/CreateFolder";
import React from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../types/data";
import {UploadFile} from "../files/UploadFile";

type ActionsMenuProps = {
	datasetId: string,
	folderId: string
}

export const NewMenu = (props: ActionsMenuProps): JSX.Element => {
	const {datasetId, folderId} = props;

	// state
	const about = useSelector((state: RootState) => state.dataset.about);

	const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
	const [createFileOpen, setCreateFileOpen] = React.useState<boolean>(false);
	const [newFolder, setNewFolder] = React.useState<boolean>(false);

	const handleCloseNewFolder = () => {
		setNewFolder(false);
	}
	const handleOptionClick = (event: React.MouseEvent<any>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleOptionClose = () => {
		setAnchorEl(null);
	};
	return (
		<Box>
			<Dialog open={createFileOpen} onClose={() => {
				setCreateFileOpen(false);
			}} fullWidth={true} maxWidth="lg" aria-labelledby="form-dialog">
				<UploadFile selectedDatasetId={datasetId} selectedDatasetName={about.name} folderId={folderId}/>
			</Dialog>

			<CreateFolder datasetId={datasetId} parentFolder={folderId} open={newFolder}
						  handleClose={handleCloseNewFolder}/>

			<Button variant="outlined" sx={{m: 1}} aria-haspopup="true" onClick={handleOptionClick}
					endIcon={<ArrowDropDownIcon/>}>
				New
			</Button>
			<Menu
				id="simple-menu"
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={handleOptionClose}
			>
				<MenuItem
					onClick={() => {
						setCreateFileOpen(true);
						handleOptionClose();
					}}>
					Upload File
				</MenuItem>
				<MenuItem
					onClick={() => {
						setNewFolder(true);
						handleOptionClose();
					}
					}>Add Folder</MenuItem>
			</Menu>
		</Box>)
}
