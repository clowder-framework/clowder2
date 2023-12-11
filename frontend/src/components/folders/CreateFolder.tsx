import React, {useState} from "react";

import {
	Button,
	Container,
	Dialog,
	DialogActions, DialogContent,
	DialogTitle, TextField
} from "@mui/material";

import LoadingOverlay from "react-loading-overlay-ts";

import {useDispatch, useSelector,} from "react-redux";
import {folderAdded} from "../../actions/folder";
import {RootState} from "../../types/data";


type CreateFolderProps = {
	datasetId: string|undefined,
	parentFolder: string|undefined|null,
	handleClose:(open:boolean) => void,
	open: boolean;
}

export const CreateFolder: React.FC<CreateFolderProps> = (props: CreateFolderProps) => {
	const dispatch = useDispatch();

	const adminMode = useSelector((state: RootState) => state.user.adminMode);
	const addFolder = (datasetId:string|undefined, folderName:string, parentFolder:string|null) => dispatch(folderAdded(datasetId, adminMode, folderName, parentFolder));
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
