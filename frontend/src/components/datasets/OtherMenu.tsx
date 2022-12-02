import {Box, Button, ListItemIcon, ListItemText, Menu, MenuItem} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import React, {useState} from "react";
import {ActionModal} from "../dialog/ActionModal";
import {datasetDeleted} from "../../actions/dataset";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import EditNameModal from "./EditNameModal";
import EditDescriptionModal from "./EditDescriptionModal";
import EditStatusModal from "./EditStatusModal";
import {MoreHoriz} from "@material-ui/icons";
import DeleteIcon from "@mui/icons-material/Delete";
import {DriveFileRenameOutline} from "@mui/icons-material";

type ActionsMenuProps = {
	datasetId: string
}

export const OtherMenu = (props: ActionsMenuProps): JSX.Element => {
	const {datasetId} = props;

	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	// redux
	const dispatch = useDispatch();
	const deleteDataset = (datasetId: string | undefined) => dispatch(datasetDeleted(datasetId));

	// state
	const [rename, setRename] = React.useState<boolean>(false);
	const [description, setDescription] = React.useState<boolean>(false);
	const [status, setStatus] = React.useState<boolean>(false);
	const [deleteDatasetConfirmOpen, setDeleteDatasetConfirmOpen] = useState(false);

	// delete dataset
	const deleteSelectedDataset = () => {
		if (datasetId) {
			deleteDataset(datasetId);
		}
		setDeleteDatasetConfirmOpen(false);
		// Go to Explore page
		history("/");
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
	const handleSetStatus = () => {
		setStatus(false);
	}
	return (
		<Box>
			<EditNameModal datasetId={datasetId} handleClose={handleSetRename} open={rename}/>
			<EditDescriptionModal datasetId={datasetId} handleClose={handleSetDescription} open={description}/>
			<EditStatusModal datasetId={datasetId} handleClose={handleSetStatus} open={status}/>
			<ActionModal actionOpen={deleteDatasetConfirmOpen} actionTitle="Are you sure?"
						 actionText="Do you really want to delete this dataset? This process cannot be undone."
						 actionBtnName="Delete" handleActionBtnClick={deleteSelectedDataset}
						 handleActionCancel={() => {
							 setDeleteDatasetConfirmOpen(false);
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
					}> <ListItemIcon>
					<DriveFileRenameOutline fontSize="small"/>
				</ListItemIcon>
					<ListItemText>Rename</ListItemText></MenuItem>
				<MenuItem
					onClick={() => {
						handleOptionClose();
						setDescription(true);
					}
					}> <ListItemIcon>
					<DriveFileRenameOutline fontSize="small"/>
				</ListItemIcon>
					<ListItemText>Update Description</ListItemText></MenuItem>
				<MenuItem
					onClick={() => {
						handleOptionClose();
						setStatus(true);
					}
					}> <ListItemIcon>
					<DriveFileRenameOutline fontSize="small"/>
				</ListItemIcon>
					<ListItemText>Change Status</ListItemText></MenuItem>
				<MenuItem
					onClick={() => {
						handleOptionClose();
						setDeleteDatasetConfirmOpen(true);
					}
					}>
					<ListItemIcon>
						<DeleteIcon fontSize="small"/>
					</ListItemIcon>
					<ListItemText>Delete Dataset</ListItemText></MenuItem>
			</Menu>
		</Box>)
}
