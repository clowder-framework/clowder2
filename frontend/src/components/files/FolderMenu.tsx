import * as React from "react";
import { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { folderDeleted } from "../../actions/folder";
import { useDispatch } from "react-redux";
import { ActionModal } from "../dialog/ActionModal";
import DeleteIcon from "@mui/icons-material/Delete";
import { ListItemIcon, ListItemText } from "@mui/material";
import { MoreHoriz } from "@material-ui/icons";
import { FolderOut } from "../../openapi/v2";
import { DriveFileRenameOutline } from "@mui/icons-material";
import EditFolderNameModal from "./EditFolderNameModal";

type FolderMenuProps = {
	folder: FolderOut;
};

export default function FolderMenu(props: FolderMenuProps) {
	const { folder } = props;
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	// confirmation dialog
	const dispatch = useDispatch();
	const deleteFolder = (datasetId: string, folderId: string | undefined) =>
		dispatch(folderDeleted(datasetId, folderId));

	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [renameModalOpen, setRenameModalOpen] = useState(false);

	const deleteSelectedFolder = () => {
		if (folder) {
			deleteFolder(folder.dataset_id, folder.id);
		}
		setConfirmationOpen(false);
	};

	const handleRenameModalClose = () => {
		setRenameModalOpen(false);
	};
	return (
		<div>
			<ActionModal
				actionOpen={confirmationOpen}
				actionTitle="Are you sure?"
				actionText="Do you really want to delete the folder? This process cannot be undone."
				actionBtnName="Delete"
				handleActionBtnClick={deleteSelectedFolder}
				handleActionCancel={() => {
					setConfirmationOpen(false);
				}}
				actionLevel={"error"}
			/>
			<EditFolderNameModal
				datasetId={folder.dataset_id}
				folderId={folder.id}
				initialFolderName={folder.name}
				handleClose={handleRenameModalClose}
				open={renameModalOpen}
			/>
			<Button
				id="basic-button"
				size="small"
				aria-controls={open ? "basic-menu" : undefined}
				aria-haspopup="true"
				aria-expanded={open ? "true" : undefined}
				onClick={handleClick}
			>
				<MoreHoriz />
			</Button>
			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					"aria-labelledby": "basic-button",
				}}
			>
				<MenuItem
					onClick={() => {
						handleClose();
						setConfirmationOpen(true);
					}}
				>
					<ListItemIcon>
						<DeleteIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Delete</ListItemText>
				</MenuItem>
				<MenuItem
					onClick={() => {
						handleClose();
						setRenameModalOpen(true);
					}}
				>
					<ListItemIcon>
						<DriveFileRenameOutline fontSize="small" />
					</ListItemIcon>
					<ListItemText>Rename</ListItemText>
				</MenuItem>
			</Menu>
		</div>
	);
}
