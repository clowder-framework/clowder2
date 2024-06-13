import React from "react";

import {
	Box,
	Button,
	Dialog,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { CreateFolder } from "../folders/CreateFolder";
import { UploadFileDragAndDrop } from "../files/UploadFileDragAndDrop";
import UploadIcon from "@mui/icons-material/Upload";
import { Folder } from "@material-ui/icons";

type ActionsMenuProps = {
	datasetId?: string;
	folderId?: string | null;
};

export const NewMenu = (props: ActionsMenuProps): JSX.Element => {
	const { datasetId, folderId } = props;

	// state
	const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
	const [dragDropFiles, setDragDropFiles] = React.useState<boolean>(false);
	const [newFolder, setNewFolder] = React.useState<boolean>(false);

	const handleCloseNewFolder = () => {
		setNewFolder(false);
	};
	const handleOptionClick = (event: React.MouseEvent<any>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleOptionClose = () => {
		setAnchorEl(null);
	};
	return (
		<Box>
			<Dialog
				open={dragDropFiles}
				onClose={() => {
					setDragDropFiles(false);
				}}
				fullWidth={true}
				maxWidth="lg"
				aria-labelledby="form-dialog"
			>
				<UploadFileDragAndDrop
					selectedDatasetId={datasetId}
					folderId={folderId}
					setDragDropFiles={setDragDropFiles}
				/>
			</Dialog>

			<CreateFolder
				datasetId={datasetId}
				parentFolder={folderId}
				open={newFolder}
				handleClose={handleCloseNewFolder}
			/>

			<Button
				variant="outlined"
				aria-haspopup="true"
				onClick={handleOptionClick}
				endIcon={<ArrowDropDownIcon />}
			>
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
						setDragDropFiles(true);
						handleOptionClose();
					}}
				>
					<ListItemIcon>
						<UploadIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Upload Files</ListItemText>
				</MenuItem>
				<MenuItem
					onClick={() => {
						setNewFolder(true);
						handleOptionClose();
					}}
				>
					<ListItemIcon>
						<Folder fontSize="small" />
					</ListItemIcon>
					<ListItemText>New Folder</ListItemText>
				</MenuItem>
			</Menu>
		</Box>
	);
};
