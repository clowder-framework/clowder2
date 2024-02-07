import React, { useState } from "react";

import {
	Button,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from "@mui/material";

import LoadingOverlay from "react-loading-overlay-ts";

import { useDispatch } from "react-redux";
import { updateFolder as updateFolderAction } from "../../actions/dataset";
import { FolderPatch } from "../../openapi/v2";

type EditNameModalProps = {
	datasetId: string;
	folderId: string;
	handleClose: () => void;
	open: boolean;
};

export default function EditFolderNameModal(props: EditNameModalProps) {
	const { datasetId, folderId, open, handleClose } = props;
	const dispatch = useDispatch();
	const updateFolder = (
		datasetId: string | undefined,
		folderId: string | undefined,
		formData: FolderPatch
	) => dispatch(updateFolderAction(datasetId, folderId, formData));

	const [loading, setLoading] = useState(false);
	const [name, setName] = useState("");

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
	};

	const onSave = async () => {
		setLoading(true);
		updateFolder(datasetId, folderId, { name: name });
		setName("");
		setLoading(false);
		handleClose();
	};

	return (
		<Container>
			<LoadingOverlay active={loading} spinner text="Saving...">
				<Dialog open={open} onClose={handleClose} fullWidth={true}>
					<DialogTitle>Rename Folder</DialogTitle>
					<DialogContent>
						<TextField
							id="outlined-name"
							variant="standard"
							fullWidth
							defaultValue={""}
							onChange={handleChange}
						/>
					</DialogContent>
					<DialogActions>
						<Button variant="contained" onClick={onSave} disabled={name == ""}>
							Save
						</Button>
						<Button onClick={handleClose}>Cancel</Button>
					</DialogActions>
				</Dialog>
			</LoadingOverlay>
		</Container>
	);
}
