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
import { setDatasetUserRole } from "../../actions/dataset";
import { useDispatch, useSelector } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import { fetchAllUsers } from "../../actions/user";
import { UserOut } from "../../openapi/v2";
import { RootState } from "../../types/data";

type EditStatusModalProps = {
	open: boolean;
	handleClose: any;
	datasetName: string;
};

export default function EditStatusModal(props: EditStatusModalProps) {
	const dispatch = useDispatch();

	const listAllUsers = (skip: number, limit: number) =>
		dispatch(fetchAllUsers(skip, limit));



	const { open, handleClose, datasetName } = props;
	const { datasetId } = useParams<{ datasetId?: string }>();
	const [email, setEmail] = useState("");
	const [showSuccessAlert, setShowSuccessAlert] = useState(false);
	const [options, setOptions] = useState([]);
	const users = useSelector((state: RootState) => state.group.users);
	const currentDatasetStatus = useSelector((state: RootState) => state.dataset.about.status);
	const [datasetStatus,setDatasetStatus ] = useState(currentDatasetStatus);

	console.log(datasetStatus, 'is status');

	const setUserRole = (datasetId: string, username: string, role: string) =>
		dispatch(setDatasetUserRole(datasetId, username, role));

	useEffect(() => {
		listAllUsers(0, 21);
	}, []);

	useEffect(() => {
		setOptions(
			users.reduce((list: string[], user: UserOut) => {
				return [...list, user.email];
			}, [])
		);
	}, [users]);

	const onSetStatus = () => {
		console.log('dataset id is', datasetId);
		console.log('dataset status is', datasetStatus)
	};

	const changeStatus = () => {
		console.log('in change status method');
		console.log()
		// setUserRole(datasetId, email, role);
		// setEmail("");
		// setRole("viewer");
		// setShowSuccessAlert(true);
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
				<DialogTitle>Change Dataset Status &apos;{datasetName}&apos;</DialogTitle>
				<Divider />
				<DialogContent>
					<Typography>Change the status of your dataset</Typography>
					<div
						style={{
							display: "flex",
							alignItems: "center",
						}}
					>
						{/*<Autocomplete*/}
						{/*	id="email-auto-complete"*/}
						{/*	freeSolo*/}
						{/*	autoHighlight*/}
						{/*	inputValue={email}*/}
						{/*	onInputChange={(event, value) => {*/}
						{/*		setEmail(value);*/}
						{/*	}}*/}
						{/*	options={options}*/}
						{/*	renderInput={(params) => (*/}
						{/*		<TextField*/}
						{/*			{...params}*/}
						{/*			sx={{*/}
						{/*				mt: 1,*/}
						{/*				mr: 1,*/}
						{/*				alignItems: "right",*/}
						{/*				width: "450px",*/}
						{/*			}}*/}
						{/*			required*/}
						{/*			label="Enter email address"*/}
						{/*		/>*/}
						{/*	)}*/}
						{/*/>{" "}*/}
						as
						<FormControl variant="outlined" sx={{ m: 1, minWidth: 120 }}>
							<InputLabel id="demo-simple-select-label">Status</InputLabel>
							<Select
								labelId="demo-simple-select-label"
								id="demo-simple-select"
								value={datasetStatus}
								defaultValue={datasetStatus}
								label="Status"
								onChange={(event, value) => {
									setDatasetStatus(event.target.value);
								}}
							>
								<MenuItem value="PRIVATE">Private</MenuItem>
								<MenuItem value="PUBLIC">Public</MenuItem>
								<MenuItem value="PUBLISHED">Published</MenuItem>
							</Select>
						</FormControl>
					</div>
					<Button
						variant="contained"
						sx={{ marginTop: 1 }}
						onClick={onSetStatus}
					>
						Change Status
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
