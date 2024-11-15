import React, { useEffect, useState } from "react";
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
import { useParams } from "react-router-dom";
import { fetchDatasetRoles, setDatasetUserRole } from "../../actions/dataset";
import { useDispatch, useSelector } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import { prefixSearchAllUsers as prefixSearchAllUsersAction } from "../../actions/user";
import { UserOut } from "../../openapi/v2";
import { RootState } from "../../types/data";

type ShareDatasetModalProps = {
	open: boolean;
	handleClose: any;
	datasetName: string;
};

export default function ShareDatasetModal(props: ShareDatasetModalProps) {
	const dispatch = useDispatch();

	const prefixSearchAllUsers = (text: string, skip: number, limit: number) =>
		dispatch(prefixSearchAllUsersAction(text, skip, limit));

	const { open, handleClose, datasetName } = props;
	const { datasetId } = useParams<{ datasetId?: string }>();
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("viewer");
	const [showSuccessAlert, setShowSuccessAlert] = useState(false);
	const [showFailAlert, setShowFailAlert] = useState(false);

	const [options, setOptions] = useState([]);
	const users = useSelector((state: RootState) => state.group.users.data);
	const datasetRoles = useSelector((state: RootState) => state.dataset.roles);
	const setUserRole = async (
		datasetId: string,
		username: string,
		role: string
	) => dispatch(setDatasetUserRole(datasetId, username, role));

	const getRoles = async (datasetId: string | undefined) =>
		dispatch(fetchDatasetRoles(datasetId));

	const myProfile = useSelector((state: RootState) => state.user.profile);

	useEffect(() => {
		prefixSearchAllUsers("", 0, 10);
	}, []);

	// dynamically update the options when user search
	useEffect(() => {
		prefixSearchAllUsers(email, 0, 10);
	}, [email]);

	useEffect(() => {
		getRoles(datasetId);
	}, []);

	useEffect(() => {
		setOptions(
			users.reduce((list: string[], user: UserOut) => {
				// don't include the current user
				if (user.email !== myProfile.email) {
					return [...list, user.email];
				}
				return list;
			}, [])
		);
	}, [users, myProfile.email]);

	const onShare = async () => {
		await setUserRole(datasetId, email, role);
		// setGroup({ label: "", id: "" });
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
					<Typography>Invite people to collaborate</Typography>
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
							inputValue={email}
							onInputChange={(event, value) => {
								setEmail(value);
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
									label="Enter email address"
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
						disabled={email.length > 0 ? false : true}
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
					<Collapse in={showFailAlert}>
						<br />
						<Alert
							severity="error"
							action={
								<IconButton
									aria-label="close"
									color="inherit"
									size="small"
									onClick={() => {
										setShowFailAlert(false);
									}}
								>
									<CloseIcon fontSize="inherit" />
								</IconButton>
							}
							sx={{ mb: 2 }}
						>
							Could not add role!
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
