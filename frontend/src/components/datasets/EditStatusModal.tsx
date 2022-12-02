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
import {DatasetIn} from "../../openapi/v2";
import {updateDataset} from "../../actions/dataset";
import {RootState} from "../../types/data";


type EditStatusModalProps = {
	datasetId: string
	handleClose:(open:boolean) => void,
	open: boolean;
}

export default function EditStatusModal(props: EditStatusModalProps) {
	const {datasetId, open, handleClose} = props;
	const dispatch = useDispatch();
	const editDataset = (datasetId: string | undefined, formData: DatasetIn) => dispatch(updateDataset(datasetId, formData));


	const about = useSelector((state: RootState) => state.dataset.about);

	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState(about["status"]);



	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setStatus(event.target.value);
	};

	const onSave = async () => {
		setLoading(true);
		editDataset(datasetId, {"status": status});
		setStatus("");
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
				<Dialog open={open} onClose={handleClose} fullWidth={true}>
					<DialogTitle>Updated Dataset Status</DialogTitle>
					<DialogContent>
							<TextField
								id="outlined-name"
								variant="standard"
								fullWidth
								multiline
								rows={4}
								defaultValue={about["status"]}
								onChange={handleChange}
							/>
					</DialogContent>
					<DialogActions>
						<Button variant="contained" onClick={onSave} disabled={status == ""}>Save</Button>
						<Button onClick={handleClose}>Cancel</Button>
					</DialogActions>
				</Dialog>
			</LoadingOverlay>
		</Container>
	);
}
