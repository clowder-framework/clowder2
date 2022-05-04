import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import { downloadFile } from '../../utils/file';
import {File} from "../../types/data";
import {useState} from "react";
import {fileDeleted} from "../../actions/file";
import {useDispatch} from "react-redux";
import {ActionModal} from "../dialog/ActionModal";
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import {Dialog, DialogTitle, ListItemIcon, ListItemText} from "@mui/material";
import {UpdateFile} from "./UpdateFile";

type FileMenuProps = {
	file: File
}

export default function FileMenu(props: FileMenuProps) {
	const {file} = props;
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
	const deleteFile = (fileId:string|undefined) => dispatch(fileDeleted(fileId));
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [updateFileOpen, setUpdateFileOpen] = useState(false);
	const deleteSelectedFile = () => {
		if (file) {
			deleteFile(file.id);
		}
		setConfirmationOpen(false);
	}

	return (
		<div>
			<ActionModal actionOpen={confirmationOpen} actionTitle="Are you sure?"
						 actionText="Do you really want to delete? This process cannot be undone."
						 actionBtnName="Delete" handleActionBtnClick={deleteSelectedFile}
						 handleActionCancel={() => { setConfirmationOpen(false);}}/>
			<Dialog open={updateFileOpen} onClose={()=>{setUpdateFileOpen(false);}} fullWidth={true} aria-labelledby="form-dialog">
				<DialogTitle id="form-dialog-title">Update File</DialogTitle>
				<UpdateFile fileId={file.id} setOpen={setUpdateFileOpen}/>
			</Dialog>
			<Button
				id="basic-button"
				// variant="outlined"
				size="small"
				aria-controls={open ? 'basic-menu' : undefined}
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				onClick={handleClick}
			>
				<MenuIcon/>
			</Button>
			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'basic-button',
				}}
			>
				<MenuItem onClick={()=>{
					handleClose();
					setUpdateFileOpen(true);
				}}>
					<ListItemIcon>
						<UploadIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Update File</ListItemText>
				</MenuItem>
				<MenuItem onClick={()=>{
					handleClose();
					downloadFile(file.id, file.name);
				}}>
					<ListItemIcon>
						<DownloadIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Download</ListItemText>
				</MenuItem>
				<MenuItem onClick={()=>{
					handleClose();
					setConfirmationOpen(true);
				}}>
					<ListItemIcon>
						<DeleteIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Delete</ListItemText>
				</MenuItem>
			</Menu>
		</div>
	);
}
