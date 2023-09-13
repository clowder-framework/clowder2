import {
	Box,
	Button,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import React, { useState } from "react";
import EditNameModal from "./EditNameModal";
import EditDescriptionModal from "./EditDescriptionModal";
import { DriveFileRenameOutline } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import { AuthWrapper } from "../auth/AuthWrapper";
import { ActionModal } from "../dialog/ActionModal";
import { deleteGroup } from "../../actions/group";
import { MoreHoriz } from "@material-ui/icons";

type ActionsMenuProps = {
	groupOwner: string;
	groupName: string;
	groupId: string | undefined;
};

export const EditMenu = (props: ActionsMenuProps): JSX.Element => {
	const { groupOwner, groupName, groupId } = props;

	const dispatch = useDispatch();
	const deleteGroupAction = (groupId: string | undefined) =>
		dispatch(deleteGroup(groupId));

	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	const role = useSelector((state: RootState) => state.group.role);
	const groupAbout = useSelector((state: RootState) => state.group.about);
	const groupCreatorEmail = useSelector(
		(state: RootState) => state.group.about.creator
	);

	// state
	const [editNameModalOpen, setEditNameModalOpen] = useState(false);
	const [editDescriptionModalOpen, setEditDescriptionModalOpen] =
		useState(false);
	const [deleteGroupConfirmOpen, setDeleteGroupConfirmOpen] = useState(false);

	const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

	const handleOptionClick = (event: React.MouseEvent<any>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleOptionClose = () => {
		setAnchorEl(null);
	};

	const deleteSelectedGroup = () => {
		if (groupId) {
			deleteGroupAction(groupId);
		}
		setDeleteGroupConfirmOpen(false);
		// Go to Explore page
		history("/");
	};

	return (
		<Box>
			<EditNameModal
				open={editNameModalOpen}
				groupOwner={groupCreatorEmail}
				handleClose={() => {
					setEditNameModalOpen(false);
				}}
				groupName={groupAbout.name}
				groupDescription={groupAbout.description}
				groupId={groupAbout.id}
			/>
			<EditDescriptionModal
				open={editDescriptionModalOpen}
				groupOwner={groupCreatorEmail}
				handleClose={() => {
					setEditDescriptionModalOpen(false);
				}}
				groupName={groupAbout.name}
				groupDescription={groupAbout.description}
				groupId={groupAbout.id}
			/>
			<ActionModal
				actionOpen={deleteGroupConfirmOpen}
				actionTitle="Are you sure?"
				actionText="Do you really want to delete this dataset? This process cannot be undone."
				actionBtnName="Delete"
				handleActionBtnClick={deleteSelectedGroup}
				handleActionCancel={() => {
					setDeleteGroupConfirmOpen(false);
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
						setEditNameModalOpen(true);
					}}
				>
					<ListItemIcon>
						<DriveFileRenameOutline fontSize="small" />
					</ListItemIcon>
					<ListItemText>Rename</ListItemText>
				</MenuItem>
				<MenuItem
					onClick={() => {
						handleOptionClose();
						setEditDescriptionModalOpen(true);
					}}
				>
					{" "}
					<ListItemIcon>
						<DriveFileRenameOutline fontSize="small" />
					</ListItemIcon>
					<ListItemText>Update Description</ListItemText>
				</MenuItem>
				<AuthWrapper currRole={role} allowedRoles={["owner"]}>
					<MenuItem
						onClick={() => {
							setDeleteGroupConfirmOpen(true);
						}}
					>
						<ListItemIcon>
							<DeleteIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Delete Group</ListItemText>
					</MenuItem>
				</AuthWrapper>
			</Menu>
		</Box>
	);
};
