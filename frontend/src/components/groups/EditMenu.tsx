import {Box, Button, ListItemIcon, ListItemText, Menu, MenuItem} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import React, {useState} from "react";
import EditNameModal from "./EditNameModal";
import EditDescriptionModal from "./EditDescriptionModal";
import {DriveFileRenameOutline} from "@mui/icons-material";
import {useDispatch, useSelector} from "react-redux";
import {GroupIn} from "../../openapi/v2";
import {updateGroup} from "../../actions/group";
import {RootState} from "../../types/data";

type ActionsMenuProps = {
	groupOwner: string;
	groupName: string;
	groupId: string | undefined;
}

export const EditMenu = (props: ActionsMenuProps): JSX.Element => {
	const {groupOwner, groupName, groupId} = props;

	const dispatch = useDispatch();
	const editGroup = (groupId: string | undefined, formData: GroupIn) => dispatch(updateGroup(groupId, formData));

	const groupAbout = useSelector((state: RootState) => state.group.about);
	const about = useSelector((state: RootState) => state.dataset.about);

	const groupCreatorEmail = useSelector(
		(state: RootState) => state.group.about.creator
	);

	// state
	const [rename, setRename] = React.useState<boolean>(false);
	const [description, setDescription] = React.useState<boolean>(false);
	const [editNameModalOpen, setEditNameModalOpen] = useState(false);
	const [editDescriptionModalOpen, setEditDescriptionModalOpen] = useState(false);

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
			<EditNameModal
				open={editNameModalOpen}
				groupOwner={groupCreatorEmail}
				handleClose={() => {
					setEditNameModalOpen(false);
				}}
				groupName={groupAbout.name}
				groupId={groupAbout.id}
			/>
			{/*<EditDescriptionModal*/}
			{/*	open={editNameModalOpen}*/}
			{/*	groupOwner={groupCreatorEmail}*/}
			{/*	handleClose={() => {*/}
			{/*		setEditDescriptionModalOpen(false);*/}
			{/*	}}*/}
			{/*	groupDescription={groupAbout.description}*/}
			{/*	groupId={groupAbout.id}*/}
			{/*/>*/}
			<Button variant="outlined" onClick={handleOptionClick}
					endIcon={<ArrowDropDownIcon/>}>
				Edit
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
			</Menu>
		</Box>)
}
