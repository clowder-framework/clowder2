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
import { fetchDatasetRoles, setDatasetGroupRole } from "../../actions/dataset";
import { useParams } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";

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
	const [group, setGroup] = useState({ label: "", id: "" });
	const [options, setOptions] = useState([]);
	const [showSuccessAlert, setShowSuccessAlert] = useState(false);
	const dispatch = useDispatch();
	const listGroups = () => dispatch(fetchGroups(0, 21));
	const groups = useSelector((state: RootState) => state.group.groups.data);
	const groupPageMetadata = useSelector(
		(state: RootState) => state.group.groups.metadata
	);
	const setGroupRole = async (
		datasetId: string,
		groupId: string,
		role: string
	) => dispatch(setDatasetGroupRole(datasetId, groupId, role));

	const getRoles = (datasetId: string | undefined) =>
		dispatch(fetchDatasetRoles(datasetId));

	// component did mount
	useEffect(() => {
		listGroups();
	}, []);

	useEffect(() => {
		setOptions(
			groups.map((g) => {
				return { label: g.name, id: g.id };
			})
		);
	}, [groups]);

	const onShare = async () => {
		await setGroupRole(datasetId, group.id, role);
		setGroup({ label: "", id: "" });
		setRole("viewer");
		setShowSuccessAlert(true);
		getRoles(datasetId);
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
							inputValue={group.name}
							onChange={(event, value) => {
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
						disabled={
							group !== undefined && group.label.length > 0 ? false : true
						}
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
