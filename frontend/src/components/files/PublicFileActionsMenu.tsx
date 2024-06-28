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
	fetchPublicFileSummary,
	INCREMENT_PUBLIC_FILE_DOWNLOADS,
} from "../../actions/public_file";
import { useDispatch, useSelector } from "react-redux";
import { Download, MoreHoriz, Upload } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import config from "../../app.config";

type PublicFileActionsMenuProps = {
	fileId?: string;
	datasetId?: string;
	setSelectedVersion: any;
};

export const PublicFileActionsMenu = (
	props: PublicFileActionsMenuProps
): JSX.Element => {
	const { fileId, datasetId, setSelectedVersion } = props;

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	// redux
	const dispatch = useDispatch();

	const listFileSummary = (fileId: string | undefined) =>
		dispatch(fetchPublicFileSummary(fileId));
	const history = useNavigate();

	return (
		<Stack
			direction="row"
			justifyContent="flex-end"
			alignItems="center"
			spacing={0.5}
		>
			<Button
				sx={{ minWidth: "auto" }}
				variant="contained"
				onClick={() => {
					dispatch({
						type: INCREMENT_PUBLIC_FILE_DOWNLOADS,
						receivedAt: Date.now(),
					});
					window.location.href = `${config.hostname}/api/v2/public_files/${fileId}`;
				}}
				endIcon={<Download />}
			>
				Download
			</Button>
		</Stack>
	);
};
