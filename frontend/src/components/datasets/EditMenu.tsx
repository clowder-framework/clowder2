import {
	Box,
	Button,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import React from "react";
import EditNameModal from "./EditNameModal";
import EditDescriptionModal from "./EditDescriptionModal";
import { DriveFileRenameOutline } from "@mui/icons-material";

type ActionsMenuProps = {
	datasetId: string;
};

export const EditMenu = (props: ActionsMenuProps): JSX.Element => {
	const { datasetId } = props;

	// state
	const [rename, setRename] = React.useState<boolean>(false);
	const [description, setDescription] = React.useState<boolean>(false);

	const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

	const handleOptionClick = (event: React.MouseEvent<any>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleOptionClose = () => {
		setAnchorEl(null);
	};
	const handleSetRename = () => {
		setRename(false);
	};
	const handleSetDescription = () => {
		setDescription(false);
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
			<Button
				variant="outlined"
				onClick={handleOptionClick}
				endIcon={<ArrowDropDownIcon />}
			>
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
			</Menu>
		</Box>
	);
};
