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
import { useSelector } from "react-redux";
import { RootState } from "../../types/data";
import DeleteIcon from "@mui/icons-material/Delete";
import { AuthWrapper } from "../auth/AuthWrapper";
import { MoreHoriz } from "@material-ui/icons";

type EditMenuProps = {
	setDeleteGroupConfirmOpen: any;
};
export const EditMenu = (props: EditMenuProps): JSX.Element => {
	const { setDeleteGroupConfirmOpen } = props;
	const groupAbout = useSelector((state: RootState) => state.group.about);
	const role = useSelector((state: RootState) => state.group.role);

	// state
	const [editNameModalOpen, setEditNameModalOpen] = useState(false);
	const [editDescriptionModalOpen, setEditDescriptionModalOpen] =
		useState(false);

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
				open={editNameModalOpen}
				handleClose={() => {
					setEditNameModalOpen(false);
				}}
				groupName={groupAbout.name}
				groupDescription={groupAbout.description}
				groupId={groupAbout.id}
			/>
			<EditDescriptionModal
				open={editDescriptionModalOpen}
				handleClose={() => {
					setEditDescriptionModalOpen(false);
				}}
				groupName={groupAbout.name}
				groupDescription={groupAbout.description}
				groupId={groupAbout.id}
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
							handleOptionClose();
							setDeleteGroupConfirmOpen(true);
						}}
					>
						<ListItemIcon>
							<DeleteIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Delete</ListItemText>
					</MenuItem>
				</AuthWrapper>
			</Menu>
		</Box>
	);
};
