import React, { useEffect, useState } from "react";
import {
	Autocomplete,
	Button,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from "@mui/material";
import { addGroupMember } from "../../actions/group";
import { useDispatch, useSelector } from "react-redux";
import { prefixSearchAllUsers as prefixSearchAllUsersAction } from "../../actions/user";
import { RootState } from "../../types/data";
import {DatasetIn, UserOut} from "../../openapi/v2";
import GroupsIcon from "@mui/icons-material/Groups";
import { InlineAlert } from "../errors/InlineAlert";
import { resetFailedReasonInline } from "../../actions/common";
import {updateDataset} from "../../actions/dataset";
import LoadingOverlay from "react-loading-overlay-ts";

type EditNameModalProps = {
	open: boolean;
	handleClose: any;
	groupName: string;
	groupId: string | undefined;
};


export default function EditNameModal(props: EditNameModalProps) {
	const {open, handleClose, groupName, groupId} = props;
	const dispatch = useDispatch();
	const editGroup = (datasetId: string | undefined, formData: DatasetIn) => dispatch(updateDataset(datasetId, formData));


	const about = useSelector((state: RootState) => state.dataset.about);

	const [loading, setLoading] = useState(false);
	const [name, setName] = useState(about["name"]);



	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
	};

	const onSave = async () => {
		setLoading(true);
		editGroup(groupId, {"name": name});
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
				<Dialog open={open} onClose={handleClose} fullWidth={true}>
					<DialogTitle>Rename Group</DialogTitle>
					<DialogContent>
							<TextField
								id="outlined-name"
								variant="standard"
								fullWidth
								defaultValue={about["name"]}
								onChange={handleChange}
							/>
					</DialogContent>
					<DialogActions>
						<Button variant="contained" onClick={onSave} disabled={name == ""}>Save</Button>
						<Button onClick={handleClose}>Cancel</Button>
					</DialogActions>
				</Dialog>
			</LoadingOverlay>
		</Container>
	);
}
