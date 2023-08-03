import React, {useState} from "react";
import {RootState} from "../../types/data";
import {
	Alert,
	Autocomplete,
	Box,
	Button, Collapse,
	Container,
	Dialog, DialogActions, DialogContent,
	DialogTitle,
	Divider,
	FormControl, IconButton,
	InputLabel,
	MenuItem,
	Select, TextField, Typography
} from "@mui/material";
import Form from "@rjsf/material-ui";

import fileSchema from "../../schema/fileSchema.json";
import {FormProps} from "@rjsf/core";
import CloseIcon from "@mui/icons-material/Close";
import {useDispatch} from "react-redux";


type SelectVersionModalProps ={
	open: boolean;
	handleClose: any;
	selected_version: number;
	fileVersions: [];
}

export const SelectVersionModal: React.FC<SelectVersionModalProps> = (props: SelectVersionModalProps) => {

	const {open, handleClose, selected_version, fileVersions, options} = props;
	const dispatch = useDispatch();
	const [selectedVersion, setSelectedVersion] = useState(selected_version);
	const [showSuccessAlert, setShowSuccessAlert] = useState(false);

	console.log('file versions', fileVersions)
	const changeVersion = () => {
		console.log('changing version');
	}

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
				<DialogTitle>Change the Version</DialogTitle>
				<Divider />
				<DialogContent>
					<Typography>Invite people to collaborate</Typography>
						as
						<FormControl variant="outlined" sx={{ m: 1, minWidth: 120 }}>
							<InputLabel id="demo-simple-select-label">Status</InputLabel>
							<Select
								labelId="demo-simple-select-label"
								id="demo-simple-select"
								value={selectedVersion}
								defaultValue={"viewer"}
								label="Status"
								onChange={(event, value) => {
									setSelectedVersion(event.target.value);
								}}
							>
								<MenuItem value="owner">Owner</MenuItem>
								<MenuItem value="editor">Editor</MenuItem>
								<MenuItem value="uploader">Uploader</MenuItem>
								<MenuItem value="viewer">Viewer</MenuItem>
							</Select>
						</FormControl>
					<Button
						variant="contained"
						sx={{ marginTop: 1 }}
						onClick={changeVersion}
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
};
