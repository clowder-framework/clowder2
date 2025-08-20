import React, { useEffect, useState } from "react";

import {
	Box,
	Button,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { ActionModal } from "../dialog/ActionModal";
import { datasetDeleted } from "../../actions/dataset";
import { fetchGroups } from "../../actions/group";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import ShareDatasetModal from "./ShareDatasetModal";
import ShareGroupDatasetModal from "./ShareGroupDatasetModal";

type ActionsMenuProps = {
	datasetId?: string;
	datasetName?: string;
};

export const ShareMenu = (props: ActionsMenuProps): JSX.Element => {
	const { datasetId, datasetName } = props;

	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	// redux
	const dispatch = useDispatch();
	const deleteDataset = (datasetId: string | undefined) =>
		dispatch(datasetDeleted(datasetId));
	const listGroups = () => dispatch(fetchGroups(0, 21));

	// component did mount
	useEffect(() => {
		listGroups();
	}, []);

	// state
	const [deleteDatasetConfirmOpen, setDeleteDatasetConfirmOpen] =
		useState(false);
	const [sharePaneOpen, setSharePaneOpen] = useState(false);
	const [shareGroupPaneOpen, setShareGroupPaneOpen] = useState(false);

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

	const handleShareClose = () => {
		setSharePaneOpen(false);
	};

	const handleShareGroupClose = () => {
		setShareGroupPaneOpen(false);
	};

	return (
		<Box>
			<ActionModal
				actionOpen={deleteDatasetConfirmOpen}
				actionTitle="Are you sure?"
				actionText="Are you sure you want to delete this dataset? This action is irreversible. All released versions, including their associated files, folders, metadata, visualizations, and thumbnails, will be permanently deleted."
				actionBtnName="Delete"
				handleActionBtnClick={deleteSelectedDataset}
				handleActionCancel={() => {
					setDeleteDatasetConfirmOpen(false);
				}}
				actionLevel={"error"}
			/>

			<ShareDatasetModal
				open={sharePaneOpen}
				handleClose={handleShareClose}
				datasetName={datasetName}
			/>
			<ShareGroupDatasetModal
				open={shareGroupPaneOpen}
				handleClose={handleShareGroupClose}
				datasetName={datasetName}
			/>

			<Button
				variant="outlined"
				onClick={handleOptionClick}
				endIcon={<ArrowDropDownIcon />}
			>
				Share
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
						setSharePaneOpen(true);
					}}
				>
					<ListItemIcon>
						<PersonIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Share with user</ListItemText>
				</MenuItem>
				<MenuItem
					onClick={() => {
						handleOptionClose();
						setShareGroupPaneOpen(true);
					}}
				>
					<ListItemIcon>
						<GroupsIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Share with group</ListItemText>
				</MenuItem>
			</Menu>
		</Box>
	);
};
