import React, { useEffect, useState } from "react";
import LoadingOverlay from "react-loading-overlay-ts";
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
import { setDatasetUserRole, updateDataset } from "../../actions/dataset";
import { useDispatch, useSelector } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import { fetchAllUsers } from "../../actions/user";
import { DatasetIn, UserOut } from "../../openapi/v2";
import { RootState } from "../../types/data";

type EditStatusModalProps = {
	open: boolean;
	handleClose: any;
	datasetName: string;
};

export default function EditStatusModal(props: EditStatusModalProps) {
	const dispatch = useDispatch();
	const { open, handleClose, datasetName } = props;
	const { datasetId } = useParams<{ datasetId?: string }>();
	const [showSuccessAlert, setShowSuccessAlert] = useState(false);
	const editDataset = (datasetId: string | undefined, formData: DatasetIn) =>
		dispatch(updateDataset(datasetId, formData));
	const about = useSelector((state: RootState) => state.dataset.about);
	const [datasetStatus, setDatasetStatus] = useState(about["status"]);
	const [loading, setLoading] = useState(false);

	const onSetStatus = () => {
		setLoading(true);
		editDataset(datasetId, { status: datasetStatus });
		setLoading(false);
		handleClose(true);
	};

	return (
		<Container>
			<LoadingOverlay active={loading} spinner text="Saving...">
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
						Change Dataset Status &apos;{datasetName}&apos;
					</DialogTitle>
					<Divider />
					<DialogContent>
						<Typography>Change the status of your dataset</Typography>
						<div
							style={{
								display: "flex",
								alignItems: "center",
							}}
						>
							<FormControl variant="outlined" sx={{ m: 1, minWidth: 120 }}>
								<InputLabel id="demo-simple-select-label">Status</InputLabel>
								<Select
									labelId="demo-simple-select-label"
									id="demo-simple-select"
									// value={datasetStatus}
									defaultValue={about["status"]}
									label="Status"
									onChange={(event, value) => {
										setDatasetStatus(event.target.value);
									}}
								>
									<MenuItem value="PRIVATE">Private</MenuItem>
									<MenuItem value="AUTHENTICATED">Authenticated</MenuItem>
									<MenuItem value="PUBLIC">Public</MenuItem>
									{/*<MenuItem value="PUBLISHED">Published</MenuItem>*/}
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
			</LoadingOverlay>
		</Container>
	);
}
