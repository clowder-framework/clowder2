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
import { updateGroup } from "../../actions/group";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { GroupIn } from "../../openapi/v2";
import { resetFailedReasonInline } from "../../actions/common";
import LoadingOverlay from "react-loading-overlay-ts";

type EditNameModalProps = {
	open: boolean;
	handleClose: any;
	groupName: string;
	groupDescription: string | undefined;
	groupId: string | undefined;
};

export default function EditNameModal(props: EditNameModalProps) {
	const { open, handleClose, groupName, groupDescription, groupId } = props;
	const dispatch = useDispatch();
	const editGroup = (groupId: string | undefined, formData: GroupIn) =>
		dispatch(updateGroup(groupId, formData));

	const groupAbout = useSelector((state: RootState) => state.group.about);

	const [loading, setLoading] = useState(false);
	const [name, setName] = useState(groupName);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
	};

	const handleDialogClose = () => {
		handleClose();
		dispatch(resetFailedReasonInline());
	};

	const onSave = async () => {
		setLoading(true);
		editGroup(groupId, {
			name: name,
			users: groupAbout.users,
			description: groupDescription,
		});
		setName("");
		setLoading(false);
		handleDialogClose();
	};

	return (
		<Container>
			<LoadingOverlay active={loading} spinner text="Saving...">
				<Dialog open={open} onClose={handleClose} fullWidth={true}>
					<DialogTitle>Rename Group</DialogTitle>
					<DialogContent>
						<TextField
							id="outlined-name"
							variant="standard"
							fullWidth
							defaultValue={groupName}
							onChange={handleChange}
						/>
					</DialogContent>
					<DialogActions>
						<Button variant="contained" onClick={onSave} disabled={name == ""}>
							Save
						</Button>
						<Button onClick={handleDialogClose}>Cancel</Button>
					</DialogActions>
				</Dialog>
			</LoadingOverlay>
		</Container>
	);
}
