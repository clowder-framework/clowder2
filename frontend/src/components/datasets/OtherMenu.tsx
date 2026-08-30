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
import { ActionModalWithCheckbox } from "../dialog/ActionModalWithCheckbox";
import {
	datasetDeleted,
	freezeDataset as freezeDatasetAction,
} from "../../actions/dataset";
import { fetchGroups } from "../../actions/group";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MoreHoriz } from "@material-ui/icons";
import DeleteIcon from "@mui/icons-material/Delete";
import EditNameModal from "./EditNameModal";
import EditDescriptionModal from "./EditDescriptionModal";
import EditStatusModal from "./EditStatusModal";
import { DriveFileRenameOutline } from "@mui/icons-material";
import { AuthWrapper } from "../auth/AuthWrapper";
import { RootState } from "../../types/data";
import ShareIcon from "@mui/icons-material/Share";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import config from "../../app.config";

type ActionsMenuProps = {
	datasetId?: string;
	datasetName?: string;
};

export const OtherMenu = (props: ActionsMenuProps): JSX.Element => {
	let doiActionText;
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
	const freezeDataset = (
		datasetId: string | undefined,
		publishDOI: boolean | undefined
	) => dispatch(freezeDatasetAction(datasetId, publishDOI));

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
	const [editStatusPaneOpen, setEditStatusPaneOpen] = useState(false);
	const [freezeDatasetConfirmOpen, setFreezeDatasetConfirmOpen] =
		useState(false);

	const handleSetRename = () => {
		setRename(false);
	};
	const handleSetDescription = () => {
		setDescription(false);
	};

	const handleEditStatusClose = () => {
		setEditStatusPaneOpen(false);
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
	const [publishDOI, setPublishDOI] = React.useState<boolean>(false);

	doiActionText =
		"By proceeding with the release, you will lock in the current content of the dataset, including all associated files, folders, metadata, and visualizations. Once released, these elements will be set as final and cannot be altered. However, you can continue to make edits and improvements on the ongoing version of the dataset.";
	if (config.enableDOI) {
		doiActionText +=
			" Optionally, you can also generate a Digital Object Identifier (DOI) by selecting the checkbox below. It will be displayed in the dataset page in the Details section.";
	}

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
			<EditStatusModal
				open={editStatusPaneOpen}
				handleClose={handleEditStatusClose}
				datasetName={datasetName}
			/>
			<ActionModal
				actionOpen={deleteDatasetConfirmOpen}
				actionTitle="Delete Dataset"
				actionText="Are you sure you want to delete this dataset? This action is irreversible. All released versions, including their associated files, folders, metadata, visualizations, and thumbnails, will be permanently deleted."
				actionBtnName="Delete"
				handleActionBtnClick={deleteSelectedDataset}
				handleActionCancel={() => {
					setDeleteDatasetConfirmOpen(false);
				}}
				actionLevel={"error"}
			/>
			<ActionModalWithCheckbox
				actionOpen={freezeDatasetConfirmOpen}
				actionTitle="Are you ready to release this version of the dataset?"
				actionText={doiActionText}
				displayCheckbox={config.enableDOI}
				checkboxLabel="Generate a DOI for this version of the dataset."
				checkboxSelected={publishDOI}
				setCheckboxSelected={setPublishDOI}
				actionBtnName="Release"
				handleActionBtnClick={() => {
					freezeDataset(datasetId, publishDOI);
					setFreezeDatasetConfirmOpen(false);
				}}
				handleActionCancel={() => {
					setFreezeDatasetConfirmOpen(false);
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
				<MenuItem
					onClick={() => {
						handleOptionClose();
						setEditStatusPaneOpen(true);
					}}
				>
					<ListItemIcon>
						<ShareIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Change Status</ListItemText>
				</MenuItem>
				<AuthWrapper currRole={datasetRole.role} allowedRoles={["owner"]}>
					<MenuItem
						onClick={() => {
							handleOptionClose();
							setFreezeDatasetConfirmOpen(true);
						}}
					>
						<ListItemIcon>
							<LocalOfferIcon fontSize="small" />
						</ListItemIcon>
						Release Version
					</MenuItem>
				</AuthWrapper>
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
