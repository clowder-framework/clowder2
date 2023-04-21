import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
	Alert,
	Autocomplete,
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
	TextField,
	Typography,
} from "@mui/material";
import { fetchGroups } from "../../actions/group";
import { RootState } from "../../types/data";
import { setDatasetGroupRole } from "../../actions/dataset";
import { useParams } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { GroupOut } from "../../openapi/v2";

type ShareGroupDatasetModalProps = {
	open: boolean;
	handleClose: any;
	datasetName: string;
};

export default function ShareGroupDatasetModal(
	props: ShareGroupDatasetModalProps
) {
	const { open, handleClose, datasetName } = props;
	const { datasetId } = useParams<{ datasetId?: string }>();
	const [role, setRole] = useState("viewer");
	const [group, setGroup] = useState("");
	const [options, setOptions] = useState([]);
	const [showSuccessAlert, setShowSuccessAlert] = useState(false);
	const dispatch = useDispatch();
	const listGroups = () => dispatch(fetchGroups(0, 21));
	const groups = useSelector((state: RootState) => state.group.groups);
	const setGroupRole = (datasetId: string, groupId: string, role: string) =>
		dispatch(setDatasetGroupRole(datasetId, groupId, role));

	// component did mount
	useEffect(() => {
		listGroups();
	}, []);

	useEffect(() => {
		setOptions(
			groups.reduce((list: string[], group: GroupOut) => {
				return [...list, group.name];
			}, [])
		);
	}, [groups]);

	const onShare = () => {
		setGroupRole(datasetId, group, role);
		setGroup("");
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
				<DialogTitle>Share dataset &apos;{datasetName}&apos;</DialogTitle>
				<Divider />
				<DialogContent>
					<Typography>Invite groups to collaborate</Typography>
					<div
						style={{
							display: "flex",
							alignItems: "center",
						}}
					>
						<Autocomplete
							id="email-auto-complete"
							freeSolo
							autoHighlight
							inputValue={group}
							onInputChange={(event, value) => {
								setGroup(value);
							}}
							options={options}
							renderInput={(params) => (
								<TextField
									{...params}
									sx={{
										mt: 1,
										mr: 1,
										alignItems: "right",
										width: "450px",
									}}
									required
									label="Enter group name"
								/>
							)}
						/>{" "}
						as
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
					<Button
						variant="contained"
						sx={{ marginTop: 1 }}
						onClick={onShare}
						disabled={group.length > 0 ? false : true}
					>
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
