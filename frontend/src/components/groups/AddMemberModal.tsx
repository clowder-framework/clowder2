import React, { useEffect, useState } from "react";
import {
	Autocomplete,
	Button,
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
import { UserOut } from "../../openapi/v2";
import GroupsIcon from "@mui/icons-material/Groups";
import { InlineAlert } from "../errors/InlineAlert";
import { resetFailedReasonInline } from "../../actions/common";

type AddMemberModalProps = {
	open: boolean;
	handleClose: any;
	groupOwner: string;
	groupName: string;
	groupId: string | undefined;
};

export default function AddMemberModal(props: AddMemberModalProps) {
	const { open, handleClose, groupOwner, groupName, groupId } = props;

	const dispatch = useDispatch();
	const prefixSearchAllUsers = (text: string, skip: number, limit: number) =>
		dispatch(prefixSearchAllUsersAction(text, skip, limit));

	const groupMemberAdded = (
		groupId: string | undefined,
		username: string | undefined
	) => dispatch(addGroupMember(groupId, username));
	const users = useSelector((state: RootState) => state.group.users.data);

	const [email, setEmail] = useState("");
	const [options, setOptions] = useState([]);
	const [alertOpen, setAlertOpen] = useState(false);
	const [validateEmail, setValidateEmail] = useState(false);

	const handleEmailChange = (event) => {
		const inputValue = event.target.value;
		setEmail(inputValue);

		// Check for valid email address using a regular expression
		const emailRegex = /^\S+@\S+\.\S+$/;
		setValidateEmail(!emailRegex.test(inputValue));
	};

	useEffect(() => {
		prefixSearchAllUsers("", 0, 10);
	}, []);

	// dynamically update the options when user search
	useEffect(() => {
		prefixSearchAllUsers(email, 0, 10);
	}, [email]);

	useEffect(() => {
		setOptions(
			users
				.reduce((list: string[], user: UserOut) => {
					return [...list, user.email];
				}, [])
				.filter((email) => email !== groupOwner)
		);
	}, [users, groupOwner]);

	const handleAddButtonClick = () => {
		groupMemberAdded(groupId, email);
		setEmail("");
	};

	const handleDialogClose = () => {
		handleClose();
		setValidateEmail(false);
		dispatch(resetFailedReasonInline());
	};

	return (
		<Dialog open={open} onClose={handleDialogClose} fullWidth={true}>
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
							onChange={handleEmailChange}
							error={validateEmail}
							helperText={validateEmail ? "Invalid email address" : ""}
						/>
					)}
				/>
				<InlineAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} />
			</DialogContent>
			<DialogActions>
				<Button onClick={handleAddButtonClick}>Add</Button>
				<Button onClick={handleDialogClose}>Cancel</Button>
			</DialogActions>
		</Dialog>
	);
}
