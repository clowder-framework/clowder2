import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import {FileOut as File} from "../../openapi/v2";
import {useState} from "react";
import {fileDeleted, fileDownloaded} from "../../actions/file";
import {useDispatch, useSelector} from "react-redux";
import {ActionModal} from "../dialog/ActionModal";
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import {Dialog, DialogTitle, ListItemIcon, ListItemText} from "@mui/material";
import {UpdateFile} from "./UpdateFile";
import {MoreHoriz} from "@material-ui/icons";
import {RootState} from "../../types/data";
import {AuthWrapper} from "../auth/AuthWrapper";
import {Member} from "../../openapi/v2";

type MemberMenuProps = {
	member: Member
}

export default function MemberMenu(props: MemberMenuProps) {
	const {member} = props;
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

	const groupRole = useSelector((state: RootState) => state.group.role);

	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [updateFileOpen, setUpdateFileOpen] = useState(false);

	return (
		<div>
			<Button
				id="basic-button"
				// variant="outlined"
				size="small"
				aria-controls={open ? 'basic-menu' : undefined}
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				onClick={handleClick}
			>
				<DeleteIcon/>
			</Button>
		</div>
	);
}
