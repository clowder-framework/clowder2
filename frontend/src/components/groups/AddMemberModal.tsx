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
import { fetchAllUsers } from "../../actions/user";
import { RootState } from "../../types/data";
import { UserOut } from "../../openapi/v2";
import GroupsIcon from "@mui/icons-material/Groups";

type AddMemberModalProps = {
	open: boolean;
	handleClose: any;
	groupName: string;
	groupId: string | undefined;
};

export default function AddMemberModal(props: AddMemberModalProps) {
	const { open, handleClose, groupName, groupId } = props;

	const dispatch = useDispatch();
	const listAllUsers = (skip: number, limit: number) =>
		dispatch(fetchAllUsers(skip, limit));
	const groupMemberAdded = (
		groupId: string | undefined,
		username: string | undefined
	) => dispatch(addGroupMember(groupId, username));
	const users = useSelector((state: RootState) => state.group.users);

	const [email, setEmail] = useState("");
	const [options, setOptions] = useState([]);

	useEffect(() => {
		listAllUsers(0, 21);
	}, []);

	useEffect(() => {
		setOptions(
			users.reduce((list: string[], user: UserOut) => {
				return [...list, user.email];
			}, [])
		);
	}, [users]);

	const handleAddButtonClick = () => {
		groupMemberAdded(groupId, email);
		setEmail("");
		handleClose();
	};
	return (
		<Container>
			<Dialog open={open} onClose={handleClose} fullWidth={true}>
				<DialogTitle>
					Add People to{" "}
					<GroupsIcon
						sx={{
							verticalAlign: "middle",
							fontSize: "1.5em",
							margin: "auto 5px",
						}}
					/>
					{groupName}
				</DialogTitle>
				<DialogContent>
					<Autocomplete
						id="email-auto-complete"
						freeSolo
						autoHighlight
						inputValue={email}
						onInputChange={(_, value) => {
							setEmail(value);
						}}
						options={options}
						renderInput={(params) => (
							<TextField
								{...params}
								sx={{ mt: 1, width: "100%" }}
								required
								label="Enter email address"
							/>
						)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleAddButtonClick}>Add</Button>
					<Button onClick={handleClose}>Cancel</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}
