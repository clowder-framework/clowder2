import React, {ChangeEvent, useEffect, useState} from "react";
import {Autocomplete, Box, Button, Chip, Grid, TextField} from "@mui/material";

import {useDispatch, useSelector} from "react-redux";
import config from "../../app.config";
import {RootState} from "../../types/data";
import {fetchAllUsers} from "../../actions/user";
import {UserOut} from "../../openapi/v2";

type SelectUsersModalProps = {
	onSave: any;
};

type SelectedUser = {
	email: string
};

export const SelectUsersModal = (props: SelectUsersModalProps): JSX.Element => {
	const {onSave} = props;

	// Redux connect equivalent
	const dispatch = useDispatch();
	const listUsers = (skip: number | undefined, limit: number | undefined) =>
		dispatch(fetchAllUsers(skip, limit));

	const [email, setEmail] = useState("");
	const myProfile = useSelector((state: RootState) => state.user.profile);
	const users = useSelector((state: RootState) => state.group.users);
	const [options, setOptions] = useState([]);
	const pageMetadata = useSelector(
		(state: RootState) => state.dataset.datasets.metadata
	);

	const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultDatasetPerPage);

	// Admin mode will fetch all projects
	useEffect(() => {
		listUsers((currPageNum - 1) * limit, limit);
	}, [currPageNum, limit]);

	useEffect(() => {
		setOptions(
			users.data?.reduce((list: string[], user: UserOut) => {
				// don't include the current user
				if (user.email !== myProfile.email) {
					return [...list, user.email];
				}
				return list;
			}, [])
		);
	}, [users, myProfile.email]);

	const selectUser = (selectedEmail: string | undefined) => {
		// add use to selection list
		if (selectedEmail) {
			const record = {email: selectedEmail};
			if (selectedUsers.filter(u => u.email === selectedEmail).length === 0) {
				setSelectedUsers([
					...selectedUsers,
					record
				]);
			}
		}
	};

	const removeUser = (selectedEmail: string | undefined) => {
		// add use to selection list
		if (selectedEmail) {
			setSelectedUsers(selectedUsers.filter(u => u.email !== selectedEmail));
		}
	};


	// pagination
	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		listUsers(newSkip, limit);
	};

	return (
		<Grid container spacing={4}>
			<Grid item xs>
				<Box display="flex" sx={{m: 1}}>
					<Grid container spacing={2}>
						{
							selectedUsers?.map((selected) => {
								return (
									<Chip label={selected.email} key={selected.email}
										  onDelete={() => removeUser(selected.email)}/>
								);
							})
						}
					</Grid>
				</Box>
				<Autocomplete
					id="email-auto-complete"
					freeSolo
					autoHighlight
					inputValue={email}
					onInputChange={(event, value) => {
						if (value !== '') {
							selectUser(value);
						}
					}}
					options={options}
					renderInput={(params) => (
						<TextField
							{...params}
							sx={{
								mt: 1,
								mr: 1,
								alignItems: "right",
								width: "450px",
							}}
							required
							label="Enter email address"
						/>
					)}
				/>
				<Box className="inputGroup">
					<Button variant="contained" onClick={() => onSave(selectedUsers)}>
						Save
					</Button>
				</Box>
			</Grid>
		</Grid>
	);
};
