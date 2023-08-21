import {
	Button,
	Dialog,
	DialogTitle,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Stack,
} from "@mui/material";
import React, { useState } from "react";
import {
	fileDeleted,
	fileDownloaded as fileDownloadedAction,
	generateFilePresignedUrl as generateFilePresignedUrlAction,
	RESET_FILE_PRESIGNED_URL,
} from "../../actions/file";
import { useDispatch, useSelector } from "react-redux";
import { Download, MoreHoriz, Upload } from "@mui/icons-material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { ActionModal } from "../dialog/ActionModal";
import { UpdateFile } from "./UpdateFile";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate } from "react-router-dom";
import { AuthWrapper } from "../auth/AuthWrapper";
import { RootState } from "../../types/data";
import { PresignedUrlShareModal } from "../sharing/PresignedUrlShareModal";

type FileActionsMenuProps = {
	fileId?: string;
	filename?: string;
	datasetId?: string;
};

export const FileActionsMenu = (props: FileActionsMenuProps): JSX.Element => {
	const { fileId, filename, datasetId } = props;

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [fileShareModalOpen, setFileShareModalOpen] = useState(false);

	const fileRole = useSelector((state: RootState) => state.file.fileRole);

	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	// redux
	const dispatch = useDispatch();

	const generateFilePresignedUrl = (
		fileId: string | undefined,
		fileVersionNum: number | undefined | null,
		expiresInSeconds: number | undefined | null
	) =>
		dispatch(
			generateFilePresignedUrlAction(fileId, fileVersionNum, expiresInSeconds)
		);
	const presignedUrl = useSelector(
		(state: RootState) => state.file.presignedUrl
	);

	const deleteFile = (fileId: string | undefined) =>
		dispatch(fileDeleted(fileId));
	const downloadFile = (
		fileId: string | undefined,
		filename: string | undefined,
		fileVersionNum: number | undefined,
		autoSave: boolean
	) =>
		dispatch(fileDownloadedAction(fileId, filename, fileVersionNum, autoSave));

	const history = useNavigate();

	const [confirmationOpen, setConfirmationOpen] = useState(false);

	const [updateFileOpen, setUpdateFileOpen] = useState(false);
	const deleteSelectedFile = () => {
		if (fileId) {
			deleteFile(fileId);
		}
		setConfirmationOpen(false);

		// Redirect back to main dataset page
		history(`/datasets/${datasetId}`);
	};
	const handleShareLinkClick = () => {
		generateFilePresignedUrl(fileId, null, 3600);
		setFileShareModalOpen(true);
	};
	const setFileShareModalClose = () => {
		setFileShareModalOpen(false);
		dispatch({ type: RESET_FILE_PRESIGNED_URL });
	};

	return (
		<Stack
			direction="row"
			justifyContent="flex-end"
			alignItems="center"
			spacing={0.5}
		>
			<ActionModal
				actionOpen={confirmationOpen}
				actionTitle="Are you sure?"
				actionText="Do you really want to delete? This process cannot be undone."
				actionBtnName="Delete"
				handleActionBtnClick={deleteSelectedFile}
				handleActionCancel={() => {
					setConfirmationOpen(false);
				}}
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
				<UpdateFile fileId={fileId} setOpen={setUpdateFileOpen} />
			</Dialog>
			<PresignedUrlShareModal
				presignedUrl={presignedUrl}
				presignedUrlShareModalOpen={fileShareModalOpen}
				setPresignedUrlShareModalOpen={setFileShareModalOpen}
				setPresignedUrlShareModalClose={setFileShareModalClose}
			/>
			<Button
				variant="contained"
				onClick={() => {
					downloadFile(fileId, filename, 0, true);
					handleClose();
				}}
				endIcon={<Download />}
			>
				Download
			</Button>
			<Button
				variant="outlined"
				onClick={handleShareLinkClick}
				endIcon={<SendIcon />}
			>
				Link
			</Button>
			{/*owner, editor can update file*/}
			<AuthWrapper currRole={fileRole} allowedRoles={["owner", "editor"]}>
				<Button
					variant="outlined"
					id="basic-button"
					aria-controls={open ? "basic-menu" : undefined}
					aria-haspopup="true"
					aria-expanded={open ? "true" : undefined}
					onClick={handleClick}
					endIcon={<ArrowDropDownIcon />}
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
							setUpdateFileOpen(true);
						}}
					>
						{" "}
						<ListItemIcon>
							<Upload fontSize="small" />
						</ListItemIcon>
						<ListItemText>Update File</ListItemText>
					</MenuItem>
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
				</Menu>
			</AuthWrapper>
		</Stack>
	);
};
