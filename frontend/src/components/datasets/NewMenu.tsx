import {
	Box,
	Button,
	Dialog,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { CreateFolder } from "../folders/CreateFolder";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { UploadFile } from "../files/UploadFile";
import { UploadFileMultiple } from "../files/UploadFileMultiple";
import UploadIcon from "@mui/icons-material/Upload";
import { Folder } from "@material-ui/icons";

type ActionsMenuProps = {
	datasetId: string;
	folderId: string | null;
};

export const NewMenu = (props: ActionsMenuProps): JSX.Element => {
	const { datasetId, folderId } = props;

	// state
	const about = useSelector((state: RootState) => state.dataset.about);

	const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
	const [createFileOpen, setCreateFileOpen] = React.useState<boolean>(false);
	const [createMultipleFileOpen, setCreateMultipleFileOpen] =
		React.useState<boolean>(false);
	const [newFolder, setNewFolder] = React.useState<boolean>(false);

	const handleCloseNewFolder = () => {
		setNewFolder(false);
	};
	const handleOptionClick = (event: React.MouseEvent<any>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleOptionClose = () => {
		setAnchorEl(null);
	};
	return (
		<Box>
			<Dialog
				open={createFileOpen}
				onClose={() => {
					setCreateFileOpen(false);
				}}
				fullWidth={true}
				maxWidth="lg"
				aria-labelledby="form-dialog"
			>
				<UploadFile
					selectedDatasetId={datasetId}
					selectedDatasetName={about.name}
					folderId={folderId}
				/>
			</Dialog>
			<Dialog
				open={createMultipleFileOpen}
				onClose={() => {
					setCreateMultipleFileOpen(false);
				}}
				fullWidth={true}
				maxWidth="lg"
				aria-labelledby="form-dialog"
			>
				<UploadFileMultiple selectedDatasetId={datasetId} folderId={folderId} />
			</Dialog>

			<CreateFolder
				datasetId={datasetId}
				parentFolder={folderId}
				open={newFolder}
				handleClose={handleCloseNewFolder}
			/>

			<Button
				variant="outlined"
				aria-haspopup="true"
				onClick={handleOptionClick}
				endIcon={<ArrowDropDownIcon />}
			>
				New
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
						setCreateFileOpen(true);
						handleOptionClose();
					}}
				>
					<ListItemIcon>
						<UploadIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Upload File</ListItemText>
				</MenuItem>
				<MenuItem
					onClick={() => {
						setCreateMultipleFileOpen(true);
						handleOptionClose();
					}}
				>
					<ListItemIcon>
						<UploadIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Upload Multiple Files</ListItemText>
				</MenuItem>
				<MenuItem
					onClick={() => {
						setNewFolder(true);
						handleOptionClose();
					}}
				>
					<ListItemIcon>
						<Folder fontSize="small" />
					</ListItemIcon>
					<ListItemText>New Folder</ListItemText>
				</MenuItem>
			</Menu>
		</Box>
	);
};
