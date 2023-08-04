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
import {useDispatch, useSelector} from "react-redux";
import {FileVersion} from "../../openapi/v2";


type SelectVersionModalProps ={
	open: boolean;
	handleClose: any;
	selected_version: number;
	fileVersions: FileVersion[];
}

export const SelectVersionModal: React.FC<SelectVersionModalProps> = (props: SelectVersionModalProps) => {

	const {open, handleClose, selected_version, fileVersions, options} = props;
	const dispatch = useDispatch();
	const version_num = useSelector( (state: RootState) => state.file.fileSummary.version_num);
	const all_versions = useSelector( (state: RootState) => state.file.fileVersions);
	const current_selected_version = useSelector((state: RootState) => state.file.selected_version_num);
	console.log('version num frilm file summary', version_num, selected_version);
	const [selectedVersion, setSelectedVersion] = useState(selected_version);
	const [showSuccessAlert, setShowSuccessAlert] = useState(false);
	if (current_selected_version === undefined) {
		console.log('current selected version is undefined');
	}
	console.log('file versions', fileVersions)
	const changeVersion = () => {
		console.log('changing version');
		console.log(selectedVersion);
		current_selected_version = selectedVersion;
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
					<Typography>Select Version</Typography>
						<FormControl variant="outlined" sx={{ m: 1, minWidth: 120 }}>
							<InputLabel id="demo-simple-select-label">Version</InputLabel>
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
								{all_versions.map((fileVersion,idx) => {
									return <MenuItem value={fileVersion.version_num}>{fileVersion.version_num}</MenuItem>
								})}
								{/*<MenuItem value="owner">Owner</MenuItem>*/}
								{/*<MenuItem value="editor">Editor</MenuItem>*/}
								{/*<MenuItem value="uploader">Uploader</MenuItem>*/}
								{/*<MenuItem value="viewer">Viewer</MenuItem>*/}
							</Select>
						</FormControl>
					<Button
						variant="contained"
						sx={{ marginTop: 1 }}
						onClick={changeVersion}
					>
						Change Version
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
							Successfully changed version!
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
