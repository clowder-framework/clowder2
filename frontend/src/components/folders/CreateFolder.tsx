import React, { useEffect, useState } from "react";

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

import { useDispatch, useSelector } from "react-redux";
import { folderAdded } from "../../actions/dataset";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../types/data";

type CreateFolderProps = {
	datasetId: string | undefined;
	parentFolder: string | undefined | null;
	handleClose: (open: boolean) => void;
	open: boolean;
};

export const CreateFolder: React.FC<CreateFolderProps> = (
	props: CreateFolderProps
) => {
	const { datasetId, parentFolder, open, handleClose } = props;

	const dispatch = useDispatch();

	const addFolder = (
		datasetId: string | undefined,
		folderName: string,
		parentFolder: string | null
	) => dispatch(folderAdded(datasetId, folderName, parentFolder));
	const newFolder = useSelector((state: RootState) => state.dataset.newFolder);

	const [loading, setLoading] = useState(false);
	const [name, setName] = useState("");

	const history = useNavigate();

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
	};

	useEffect(() => {
		if (newFolder.id) {
			// Stop spinner
			setLoading(false);
			setName("");
			handleClose(true);
			history(`/datasets/${datasetId}?folder=${newFolder.id}`);
		}
	}, [newFolder]);

	const onSave = async () => {
		setLoading(true);
		addFolder(datasetId, name, parentFolder);
	};

	return (
		<Container>
			<LoadingOverlay active={loading} spinner text="Saving...">
				<Dialog
					open={open}
					onClose={handleClose}
					fullWidth={true}
					aria-labelledby="create-dataset"
				>
					<DialogTitle>Create New Folder</DialogTitle>
					<DialogContent>
						<TextField
							id="outlined-name"
							label="Folder Name"
							variant="standard"
							fullWidth
							value={name}
							onChange={handleChange}
						/>
					</DialogContent>
					<DialogActions>
						<Button variant="contained" onClick={onSave} disabled={name == ""}>
							Create
						</Button>
						<Button onClick={handleClose}>Cancel</Button>
					</DialogActions>
				</Dialog>
			</LoadingOverlay>
		</Container>
	);
};
