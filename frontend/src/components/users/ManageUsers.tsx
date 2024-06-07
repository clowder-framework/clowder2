import React, { ChangeEvent, useEffect, useState } from "react";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../Layout";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
	fetchAllUsers as fetchAllUsersAction,
	fetchUserProfile,
	prefixSearchAllUsers as prefixSearchAllUsersAction,
	revokeAdmin as revokeAdminAction,
	setAdmin as setAdminAction,
	enableReadOnly as setEnableReadOnlyAction,
	disableReadOnly as setDisableReadOnlyAction,
} from "../../actions/user";
import { Box, Grid, Pagination, Switch } from "@mui/material";
import { ErrorModal } from "../errors/ErrorModal";
import { GenericSearchBox } from "../search/GenericSearchBox";
import Gravatar from "react-gravatar";
import PersonIcon from "@mui/icons-material/Person";
import config from "../../app.config";

export const ManageUsers = (): JSX.Element => {
	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit, setLimit] = useState<number>(config.defaultUserPerPage);
	const [errorOpen, setErrorOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState<string>("");

	const dispatch = useDispatch();
	const users = useSelector((state: RootState) => state.group.users.data);
	const pageMetadata = useSelector(
		(state: RootState) => state.group.users.metadata
	);
	const currentUser = useSelector((state: RootState) => state.user.profile);

	const fetchAllUsers = (skip: number, limit: number) =>
		dispatch(fetchAllUsersAction(skip, limit));
	const fetchCurrentUser = () => dispatch(fetchUserProfile());
	const prefixSearchAllUsers = (text: string, skip: number, limit: number) =>
		dispatch(prefixSearchAllUsersAction(text, skip, limit));

	const setAdmin = (email: string) => dispatch(setAdminAction(email));
	const revokeAdmin = (email: string) => dispatch(revokeAdminAction(email));

	const setEnableReadOnly = (email: string) =>
		dispatch(setEnableReadOnlyAction(email));
	const setDisableReadOnly = (email: string) =>
		dispatch(setDisableReadOnlyAction(email));

	// component did mount
	useEffect(() => {
		fetchAllUsers(0, limit);
		fetchCurrentUser();
	}, []);

	const searchUsers = (searchTerm: string) => {
		prefixSearchAllUsers(searchTerm, (currPageNum - 1) * limit, limit);
		setSearchTerm(searchTerm);
	};

	// search while typing
	useEffect(() => {
		// reset page with each new search term
		setCurrPageNum(1);
		if (searchTerm !== "") prefixSearchAllUsers(searchTerm, 0, limit);
		else fetchAllUsers(0, limit);
	}, [searchTerm]);

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		if (searchTerm !== "") prefixSearchAllUsers(searchTerm, newSkip, limit);
		else fetchAllUsers(newSkip, limit);
	};

	const changeReadOnly = (email: string, readOnly: boolean) => {
		if (readOnly) {
			setEnableReadOnly(email);
		} else {
			setDisableReadOnly(email);
		}
	};

	return (
		<Layout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />
			<div className="outer-container">
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<GenericSearchBox
							title="Search for Users"
							searchPrompt="search by email"
							setSearchTerm={setSearchTerm}
							searchTerm={searchTerm}
							searchFunction={searchUsers}
							skip={(currPageNum - 1) * limit}
							limit={limit}
						/>
					</Grid>
					<Grid item xs={12}>
						<TableContainer component={Paper}>
							<Table sx={{ minWidth: 650 }} aria-label="simple table">
								<TableHead>
									<TableRow>
										<TableCell>Name</TableCell>
										<TableCell align="right">Email</TableCell>
										<TableCell align="center">Admin</TableCell>
										<TableCell align="left">Read Only</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{users.map((profile) => {
										return (
											<TableRow
												sx={{
													"&:last-child td, &:last-child th": { border: 0 },
												}}
											>
												<TableCell>
													{profile.email !== undefined ? (
														<Gravatar
															email={profile.email}
															rating="g"
															style={{
																width: "32px",
																height: "32px",
																borderRadius: "50%",
																verticalAlign: "middle",
																marginRight: "1em",
															}}
														/>
													) : (
														<PersonIcon
															sx={{
																verticalAlign: "middle",
																marginRight: "1em",
															}}
														/>
													)}
													{profile.first_name} {profile.last_name}
												</TableCell>
												<TableCell align="right">{profile.email}</TableCell>
												<TableCell align="center">
													<Switch
														color="primary"
														checked={profile.admin}
														onChange={() => {
															if (profile.admin) {
																revokeAdmin(profile.email);
															} else {
																setAdmin(profile.email);
															}
														}}
														disabled={
															profile.email === currentUser.email ||
															profile.read_only_user
														}
													/>
												</TableCell>
												<TableCell align="left">
													<Switch
														color="primary"
														checked={profile.read_only_user}
														onChange={() => {
															if (profile.read_only_user) {
																changeReadOnly(profile.email, false);
															} else {
																changeReadOnly(profile.email, true);
															}
														}}
														disabled={
															profile.email === currentUser.email ||
															profile.admin
														}
													/>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
							<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
								<Pagination
									count={Math.ceil(pageMetadata.total_count / limit)}
									page={currPageNum}
									onChange={handlePageChange}
									shape="rounded"
									variant="outlined"
								/>
							</Box>
						</TableContainer>
					</Grid>
				</Grid>
			</div>
		</Layout>
	);
};
