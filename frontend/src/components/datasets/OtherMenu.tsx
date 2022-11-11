import {Box, Button, Menu, MenuItem} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import React, {useState} from "react";
import {ActionModal} from "../dialog/ActionModal";
import {datasetDeleted} from "../../actions/dataset";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../types/data";
import {folderDeleted} from "../../actions/folder";
import EditNameModal from "./EditNameModal";
import EditDescriptionModal from "./EditDescriptionModal";
import {MoreHoriz} from "@material-ui/icons";

type ActionsMenuProps = {
	datasetId: string,
	folderId: string
}

export const OtherMenu = (props: ActionsMenuProps): JSX.Element => {
	const {datasetId, folderId} = props;

	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	// redux
	const dispatch = useDispatch();
	const deleteDataset = (datasetId: string | undefined) => dispatch(datasetDeleted(datasetId));
	const deleteFolder = (datasetId: string | undefined, folderId: string | undefined) => dispatch(folderDeleted(datasetId, folderId));

	// state
	const [rename, setRename] = React.useState<boolean>(false);
	const [description, setDescription] = React.useState<boolean>(false);
	const [deleteDatasetConfirmOpen, setDeleteDatasetConfirmOpen] = useState(false);
	const folderPath = useSelector((state: RootState) => state.folder.folderPath);

	// delete dataset
	const deleteSelectedDataset = () => {
		if (datasetId) {
			deleteDataset(datasetId);
		}
		setDeleteDatasetConfirmOpen(false);
		// Go to Explore page
		history("/");
	}

	// delete folder
	const [deleteFolderConfirmOpen, setDeleteFolderConfirmOpen] = useState(false);
	const deleteSelectedFolder = () => {
		if (folderId) {
			deleteFolder(datasetId, folderId);
		}
		setDeleteFolderConfirmOpen(false);
		// Go to upper level not properly working
		if (folderPath != null && folderPath.length > 1) {
			const parentFolderId = folderPath.at(-2)["folder_id"]
			history(`/datasets/${datasetId}?folder=${parentFolderId}`);
		} else {
			history(`/datasets/${datasetId}`);
		}
	}

	const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

	const handleOptionClick = (event: React.MouseEvent<any>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleOptionClose = () => {
		setAnchorEl(null);
	};
	const handleSetRename = () => {
		setRename(false);
	}
	const handleSetDescription = () => {
		setDescription(false);
	}
	return (
		<Box>
			<EditNameModal datasetId={datasetId} handleClose={handleSetRename} open={rename}/>
			<EditDescriptionModal datasetId={datasetId} handleClose={handleSetDescription} open={description}/>
			<ActionModal actionOpen={deleteDatasetConfirmOpen} actionTitle="Are you sure?"
						 actionText="Do you really want to delete this dataset? This process cannot be undone."
						 actionBtnName="Delete" handleActionBtnClick={deleteSelectedDataset}
						 handleActionCancel={() => {
							 setDeleteDatasetConfirmOpen(false);
						 }}/>
			<ActionModal actionOpen={deleteFolderConfirmOpen} actionTitle="Are you sure?"
						 actionText="Do you really want to delete this folder? This process cannot be undone."
						 actionBtnName="Delete" handleActionBtnClick={deleteSelectedFolder}
						 handleActionCancel={() => {
							 setDeleteFolderConfirmOpen(false);
						 }}/>
				<Button variant="outlined" onClick={handleOptionClick}
						endIcon={<ArrowDropDownIcon/>}>
					<MoreHoriz/>
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
							handleOptionClose();
							setRename(true);
						}
						}>Rename Dataset</MenuItem>
					<MenuItem
						onClick={() => {
							handleOptionClose();
							setDescription(true);
						}
						}>Update Description</MenuItem>
					<MenuItem
						onClick={() => {
							handleOptionClose();
							setDeleteDatasetConfirmOpen(true);
						}
						}>Delete Dataset</MenuItem>
					<MenuItem
						onClick={() => {
							handleOptionClose();
							setDeleteFolderConfirmOpen(true);
						}
						}>
						Delete Folder</MenuItem>
				</Menu>
		</Box>)
}
