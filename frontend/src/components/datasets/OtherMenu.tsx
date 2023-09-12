import {
	Box,
	Button,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import React, { useEffect, useState } from "react";
import { ActionModal } from "../dialog/ActionModal";
import { datasetDeleted } from "../../actions/dataset";
import { fetchGroups } from "../../actions/group";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MoreHoriz } from "@material-ui/icons";
import DeleteIcon from "@mui/icons-material/Delete";
import EditNameModal from "./EditNameModal";
import EditDescriptionModal from "./EditDescriptionModal";
import { DriveFileRenameOutline } from "@mui/icons-material";
import { AuthWrapper } from "../auth/AuthWrapper";
import { RootState } from "../../types/data";

type ActionsMenuProps = {
	datasetId: string;
	datasetName: string;
};

export const OtherMenu = (props: ActionsMenuProps): JSX.Element => {
	const { datasetId, datasetName } = props;

	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	// redux
	const dispatch = useDispatch();
	const deleteDataset = (datasetId: string | undefined) =>
		dispatch(datasetDeleted(datasetId));
	const datasetRole = useSelector(
		(state: RootState) => state.dataset.datasetRole
	);

	const listGroups = () => dispatch(fetchGroups(0, 21));

	// component did mount
	useEffect(() => {
		listGroups();
	}, []);

	// state
	const [rename, setRename] = React.useState<boolean>(false);
	const [description, setDescription] = React.useState<boolean>(false);
	const [deleteDatasetConfirmOpen, setDeleteDatasetConfirmOpen] =
		useState(false);

	const handleSetRename = () => {
		setRename(false);
	};
	const handleSetDescription = () => {
		setDescription(false);
	};

	// delete dataset
	const deleteSelectedDataset = () => {
		if (datasetId) {
			deleteDataset(datasetId);
		}
		setDeleteDatasetConfirmOpen(false);
		// Go to Explore page
		history("/");
	};

	const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

	const handleOptionClick = (event: React.MouseEvent<any>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleOptionClose = () => {
		setAnchorEl(null);
	};

	return (
		<Box>
			<EditNameModal
				datasetId={datasetId}
				handleClose={handleSetRename}
				open={rename}
			/>
			<EditDescriptionModal
				datasetId={datasetId}
				handleClose={handleSetDescription}
				open={description}
			/>
			<ActionModal
				actionOpen={deleteDatasetConfirmOpen}
				actionTitle="Are you sure?"
				actionText="Do you really want to delete this dataset? This process cannot be undone."
				actionBtnName="Delete"
				handleActionBtnClick={deleteSelectedDataset}
				handleActionCancel={() => {
					setDeleteDatasetConfirmOpen(false);
				}}
			/>
			<Button
				variant="outlined"
				onClick={handleOptionClick}
				endIcon={<ArrowDropDownIcon />}
			>
				<MoreHoriz />
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
					}}
				>
					{" "}
					<ListItemIcon>
						<DriveFileRenameOutline fontSize="small" />
					</ListItemIcon>
					<ListItemText>Rename</ListItemText>
				</MenuItem>
				<MenuItem
					onClick={() => {
						handleOptionClose();
						setDescription(true);
					}}
				>
					{" "}
					<ListItemIcon>
						<DriveFileRenameOutline fontSize="small" />
					</ListItemIcon>
					<ListItemText>Update Description</ListItemText>
				</MenuItem>
				<AuthWrapper
					currRole={datasetRole.role}
					allowedRoles={["owner", "editor"]}
				>
					<MenuItem
						onClick={() => {
							handleOptionClose();
							setDeleteDatasetConfirmOpen(true);
						}}
					>
						<ListItemIcon>
							<DeleteIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Delete Dataset</ListItemText>
					</MenuItem>
				</AuthWrapper>
			</Menu>
		</Box>
	);
};
