import React, { useState } from "react";
import { RootState } from "../../types/data";
import {
	Alert,
	Button,
	Collapse,
	Dialog,
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
import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";
import { FileVersion } from "../../openapi/v2";

type SelectVersionModalProps = {
	open: boolean;
	handleClose: any;
	selectedVersion: number | undefined;
	setSelectedVersion: any;
	fileVersions: FileVersion[];
};

export const SelectVersionModal: React.FC<SelectVersionModalProps> = (
	props: SelectVersionModalProps
) => {
	const { open, handleClose, selectedVersion, setSelectedVersion } = props;

	const all_versions = useSelector(
		(state: RootState) => state.file.fileVersions
	);

	const [showSuccessAlert, setShowSuccessAlert] = useState(false);

	return (
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
						onChange={(event) => {
							setSelectedVersion(event.target.value);
						}}
					>
						{all_versions.map((fileVersion) => {
							return (
								<MenuItem value={fileVersion.version_num}>
									{fileVersion.version_num}
								</MenuItem>
							);
						})}
					</Select>
				</FormControl>
				<Button variant="contained" sx={{ marginTop: 1 }} onClick={handleClose}>
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
		</Dialog>
	);
};
