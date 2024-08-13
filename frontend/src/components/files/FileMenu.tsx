import * as React from "react";
import { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { FileOut as File } from "../../openapi/v2";
import { fileDeleted } from "../../actions/file";
import { useDispatch, useSelector } from "react-redux";
import { ActionModal } from "../dialog/ActionModal";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";
import { Dialog, DialogTitle, ListItemIcon, ListItemText } from "@mui/material";
import { UpdateFile } from "./UpdateFile";
import { MoreHoriz } from "@material-ui/icons";
import { RootState } from "../../types/data";
import { AuthWrapper } from "../auth/AuthWrapper";
import config from "../../app.config";
import { FrozenWrapper } from "../auth/FrozenWrapper";

type FileMenuProps = {
	file: File;
	setSelectedVersion: any;
	publicView: boolean | false;
};

export default function FileMenu(props: FileMenuProps) {
	const { file, setSelectedVersion, publicView } = props;
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
	const deleteFile = (fileId: string | undefined) =>
		dispatch(fileDeleted(fileId));
	// need to update file role
	const datasetRole = useSelector(
		(state: RootState) => state.dataset.datasetRole
	);
	const dataset = useSelector((state: RootState) => state.dataset.about);

	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [updateFileOpen, setUpdateFileOpen] = useState(false);
	const deleteSelectedFile = () => {
		if (file) {
			deleteFile(file.id);
		}
		setConfirmationOpen(false);
	};

	return (
		<div>
			<ActionModal
				actionOpen={confirmationOpen}
				actionTitle="Are you sure?"
				actionText="Do you really want to delete? This process cannot be undone."
				actionBtnName="Delete"
				handleActionBtnClick={deleteSelectedFile}
				handleActionCancel={() => {
					setConfirmationOpen(false);
				}}
				actionLevel={"error"}
			/>
			<Dialog
				open={updateFileOpen}
				onClose={() => {
					setUpdateFileOpen(false);
				}}
				fullWidth={true}
				aria-labelledby="form-dialog"
			>
				<DialogTitle id="form-dialog-title">Update File</DialogTitle>
				<UpdateFile
					fileId={file.id}
					setOpen={setUpdateFileOpen}
					setSelectedVersion={setSelectedVersion}
				/>
			</Dialog>
			<Button
				id="basic-button"
				// variant="outlined"
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
				{publicView ? (
					<MenuItem
						onClick={() => {
							handleClose();
							window.location.href = `${config.hostname}/api/v2/public_files/${file.id}`;
						}}
					>
						<ListItemIcon>
							<DownloadIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Download</ListItemText>
					</MenuItem>
				) : (
					<MenuItem
						onClick={() => {
							handleClose();
							window.location.href = `${config.hostname}/api/v2/files/${file.id}`;
						}}
					>
						<ListItemIcon>
							<DownloadIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Download</ListItemText>
					</MenuItem>
				)}
				<FrozenWrapper
					frozen={dataset.frozen}
					frozenVersionNum={dataset.frozen_version_num}
				>
					{/*owner, editor can update file*/}
					<AuthWrapper
						currRole={datasetRole.role}
						allowedRoles={["owner", "editor"]}
					>
						<MenuItem
							onClick={() => {
								handleClose();
								setUpdateFileOpen(true);
							}}
						>
							<ListItemIcon>
								<UploadIcon fontSize="small" />
							</ListItemIcon>
							<ListItemText>Update File</ListItemText>
						</MenuItem>
					</AuthWrapper>

					{/*owner can delete file*/}
					<AuthWrapper currRole={datasetRole.role} allowedRoles={["owner"]}>
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
					</AuthWrapper>
				</FrozenWrapper>
			</Menu>
		</div>
	);
}
