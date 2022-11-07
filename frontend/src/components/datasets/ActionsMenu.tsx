import {Box, Button, Dialog, Menu, MenuItem} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {CreateFolder} from "../folders/CreateFolder";
import React, {useState} from "react";
import {ActionModal} from "../dialog/ActionModal";
import {datasetDeleted} from "../../actions/dataset";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../types/data";
import {folderDeleted} from "../../actions/folder";
import {UploadFile} from "../files/UploadFile";

type ActionsMenuProps = {
	datasetId: string,
	folderId: string
}

export const ActionsMenu = (props: ActionsMenuProps): JSX.Element => {
	const {datasetId, folderId} = props;

	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	// redux
	const dispatch = useDispatch();
	const deleteDataset = (datasetId: string | undefined) => dispatch(datasetDeleted(datasetId));
	const deleteFolder = (datasetId: string | undefined, folderId: string | undefined) => dispatch(folderDeleted(datasetId, folderId));

	// state
	const [deleteDatasetConfirmOpen, setDeleteDatasetConfirmOpen] = useState(false);
	const folderPath = useSelector((state: RootState) => state.folder.folderPath);
	const about = useSelector((state: RootState) => state.dataset.about);

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

	const optionMenuItem = {
		fontWeight: "normal",
		fontSize: "14px",
		marginTop: "8px",
	}

	const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
	const [createFileOpen, setCreateFileOpen] = React.useState<boolean>(false);
	// new folder dialog
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
			{/*Confirmation dialogue*/}
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
			<Dialog open={createFileOpen} onClose={() => {
				setCreateFileOpen(false);
			}} fullWidth={true} maxWidth="lg" aria-labelledby="form-dialog">
				<UploadFile selectedDatasetId={datasetId} selectedDatasetName={about.name} folderId={folderId}/>
			</Dialog>
			<Button aria-haspopup="true" onClick={handleOptionClick}
					sx={{
						padding: "6px 12px",
						width: "100px",
						background: "#6C757D",
						borderRadius: "4px",
						color: "white",
						textTransform: "capitalize",
						'&:hover': {
							color: "black"
						},
					}} endIcon={<ArrowDropDownIcon/>}>
				Options
			</Button>
			<Menu
				id="simple-menu"
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={handleOptionClose}
			>
				<MenuItem sx={optionMenuItem}
						  onClick={() => {
							  setCreateFileOpen(true);
							  handleOptionClose();
						  }}>
					Upload File
				</MenuItem>
				<MenuItem sx={optionMenuItem}
						  onClick={() => {
							  setNewFolder(true);
							  handleOptionClose();
						  }
						  }>Add Folder</MenuItem>
				<CreateFolder datasetId={datasetId} parentFolder={folderId} open={newFolder}
							  handleClose={handleCloseNewFolder}/>
				{/*backend not implemented yet*/}
				<MenuItem sx={optionMenuItem}
						  onClick={() => {
							  handleOptionClose();
						  }}>
					Download Dataset
				</MenuItem>
				<MenuItem sx={optionMenuItem}
						  onClick={() => {
							  handleOptionClose();
							  setDeleteDatasetConfirmOpen(true);
						  }
						  }>Delete Dataset</MenuItem>
				<MenuItem sx={optionMenuItem}
						  onClick={() => {
							  handleOptionClose();
							  setDeleteFolderConfirmOpen(true);
						  }
						  }>
					Delete Folder</MenuItem>
				<MenuItem onClick={handleOptionClose} sx={optionMenuItem}
						  disabled={true}>Follow</MenuItem>
				<MenuItem onClick={handleOptionClose} sx={optionMenuItem}
						  disabled={true}>Collaborators</MenuItem>
				<MenuItem onClick={handleOptionClose} sx={optionMenuItem}
						  disabled={true}>Extraction</MenuItem>
			</Menu>
		</Box>)
}
