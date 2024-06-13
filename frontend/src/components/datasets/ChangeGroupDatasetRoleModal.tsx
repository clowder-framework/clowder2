import React, { useState } from "react";

import { useDispatch } from "react-redux";
import {
	Alert,
	Button,
	Collapse,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Typography,
} from "@mui/material";
import { setDatasetGroupRole } from "../../actions/dataset";
import { useParams } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";

type ChangeGroupDatasetRoleModalProps = {
	open: boolean;
	handleClose: any;
	datasetName: string;
	currentRole: string;
	currentGroupName: string;
	currentGroupId: string;
};

export default function ChangeGroupDatasetRoleModal(
	props: ChangeGroupDatasetRoleModalProps
) {
	const {
		open,
		handleClose,
		datasetName,
		currentRole,
		currentGroupName,
		currentGroupId,
	} = props;
	const { datasetId } = useParams<{ datasetId?: string }>();
	const [role, setRole] = useState(currentRole);
	const [group, setGroup] = useState();
	const [showSuccessAlert, setShowSuccessAlert] = useState(false);
	const dispatch = useDispatch();
	const setGroupRole = (datasetId: string, groupId: string, role: string) =>
		dispatch(setDatasetGroupRole(datasetId, groupId, role));

	const onShare = () => {
		setGroupRole(datasetId, currentGroupId, role);
		setGroup(group);
		setRole("viewer");
		setShowSuccessAlert(true);
	};

	return (
		<Container>
			<Dialog
				open={open}
				onClose={handleClose}
				fullWidth={true}
				maxWidth="md"
				sx={{
					".MuiPaper-root": {
						padding: "2em",
					},
				}}
			>
				<DialogTitle>
					Change dataset role for &apos;{datasetName}&apos;
				</DialogTitle>
				<Divider />
				<DialogContent>
					<Typography>Invite groups to collaborate</Typography>
					<div
						style={{
							display: "flex",
							alignItems: "center",
						}}
					>
						{" "}
						group is {currentGroupName}
						<FormControl variant="outlined" sx={{ m: 1, minWidth: 120 }}>
							<InputLabel id="demo-simple-select-label">Status</InputLabel>
							<Select
								labelId="demo-simple-select-label"
								id="demo-simple-select"
								value={role}
								defaultValue={"viewer"}
								label="Status"
								onChange={(event, value) => {
									setRole(event.target.value);
								}}
							>
								<MenuItem value="owner">Owner</MenuItem>
								<MenuItem value="editor">Editor</MenuItem>
								<MenuItem value="uploader">Uploader</MenuItem>
								<MenuItem value="viewer">Viewer</MenuItem>
							</Select>
						</FormControl>
					</div>
					<Button variant="contained" sx={{ marginTop: 1 }} onClick={onShare}>
						Share
					</Button>
					<Collapse in={showSuccessAlert}>
						<br />
						<Alert
							severity="success"
							action={
								<IconButton
									aria-label="close"
									color="inherit"
									size="small"
									onClick={() => {
										setShowSuccessAlert(false);
									}}
								>
									<CloseIcon fontSize="inherit" />
								</IconButton>
							}
							sx={{ mb: 2 }}
						>
							Successfully added role!
						</Alert>
					</Collapse>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Close</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}
