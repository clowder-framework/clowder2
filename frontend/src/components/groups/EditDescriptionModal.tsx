
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
import {updateGroup} from "../../actions/group";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import {GroupIn} from "../../openapi/v2";
import GroupsIcon from "@mui/icons-material/Groups";
import { InlineAlert } from "../errors/InlineAlert";
import { resetFailedReasonInline } from "../../actions/common";
import LoadingOverlay from "react-loading-overlay-ts";

type EditDescriptionModalProps = {
	open: boolean;
	handleClose: any;
	groupOwner: string;
	groupDescription: string | undefined;
	groupId: string | undefined;
};


export default function EditNameModal(props: EditDescriptionModalProps) {
	const {open, handleClose, groupOwner, groupDescription, groupId} = props;
	const dispatch = useDispatch();
	const editGroup = (groupId: string | undefined, formData: GroupIn) => dispatch(updateGroup(groupId, formData));

	const groupAbout = useSelector((state: RootState) => state.group.about);
	const about = useSelector((state: RootState) => state.dataset.about);

	const [loading, setLoading] = useState(false);
	const [description, setDescription] = useState(groupDescription);



	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDescription(event.target.value);
	};

	const handleDialogClose = () => {
		handleClose();
		dispatch(resetFailedReasonInline());
	};

	const onSave = async () => {
		setLoading(true);
		editGroup(groupId, {"description": description, "users": groupAbout.users});
		setDescription("");
		setLoading(false);
		handleDialogClose();
	};

	return (
		<Container>
			<LoadingOverlay
				active={loading}
				spinner
				text="Saving..."
			>
				<Dialog open={open} onClose={handleClose} fullWidth={true}>
					<DialogTitle>Change Group Description</DialogTitle>
					<DialogContent>
							<TextField
								id="outlined-name"
								variant="standard"
								fullWidth
								defaultValue={groupDescription}
								onChange={handleChange}
							/>
					</DialogContent>
					<DialogActions>
						<Button variant="contained" onClick={onSave} disabled={description == ""}>Save</Button>
						<Button onClick={handleDialogClose}>Cancel</Button>
					</DialogActions>
				</Dialog>
			</LoadingOverlay>
		</Container>
	);
}
