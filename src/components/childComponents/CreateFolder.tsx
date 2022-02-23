import React, {useState} from "react";

import {
	Button,
	Container,
	Dialog,
	DialogActions, DialogContent,
	DialogTitle, TextField
} from "@mui/material";

import LoadingOverlay from "react-loading-overlay-ts";

import {useDispatch,} from "react-redux";
import {folderAdded} from "../../actions/dataset";


type CreateFolderProps = {
	datasetId: string,
	parentFolder: string,
	handleClose:(open:boolean) => void,
	open: boolean;
}

export const CreateFolder: React.FC<CreateFolderProps> = (props: CreateFolderProps) => {
	const dispatch = useDispatch();
	const addFolder = (datasetId:string|undefined, folderName:string, parentFolder:string|null) => dispatch(folderAdded(datasetId, folderName, parentFolder));
	const {datasetId, parentFolder, open, handleClose} = props;

	const [loading, setLoading] = useState(false);
	const [name, setName] = useState("");

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
	};

	const onSave = async () => {
		setLoading(true);
		addFolder(datasetId, name, parentFolder);
		setName("");
		setLoading(false);
		handleClose(true);
	};

	return (
		<Container>
			<LoadingOverlay
				active={loading}
				spinner
				text="Saving..."
			>
				<Dialog open={open} onClose={handleClose} fullWidth={true} aria-labelledby="create-dataset">
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
						<Button variant="contained" onClick={onSave} disabled={name == ""}>Create</Button>
						<Button onClick={handleClose}>Cancel</Button>
					</DialogActions>
				</Dialog>
			</LoadingOverlay>
		</Container>
	);
};
