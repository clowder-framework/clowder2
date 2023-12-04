import React, { useEffect, useState } from "react";
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
	revokeAdmin as revokeAdminAction,
	setAdmin as setAdminAction,
} from "../../actions/user";
import { Box, Button, ButtonGroup } from "@mui/material";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import { ErrorModal } from "../errors/ErrorModal";

export const ManageUsers = (): JSX.Element => {
	const [currPageNum, setCurrPageNum] = useState<number>(0);
	const [limit, setLimit] = useState<number>(5);
	const [skip, setSkip] = useState<number>(0);
	const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
	const [nextDisabled, setNextDisabled] = useState<boolean>(false);
	const [errorOpen, setErrorOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState<string>("");

	const dispatch = useDispatch();
	const users = useSelector((state: RootState) => state.group.users);
	const currentUser = useSelector((state: RootState) => state.user.profile);

	const fetchAllUsers = (skip: number, limit: number) =>
		dispatch(fetchAllUsersAction(skip, limit));
	const fetchCurrentUser = () => dispatch(fetchUserProfile());

	const setAdmin = (email: string) => dispatch(setAdminAction(email));
	const revokeAdmin = (email: string) => dispatch(revokeAdminAction(email));

	// component did mount
	useEffect(() => {
		fetchAllUsers(skip, limit);
		fetchCurrentUser();
	}, []);

	useEffect(() => {
		// disable flipping if reaches the last page
		if (users.length < limit) setNextDisabled(true);
		else setNextDisabled(false);
	}, [users]);

	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			fetchAllUsers(skip, limit);
			if (skip === 0) setPrevDisabled(true);
			else setPrevDisabled(false);
		}
	}, [skip]);

	const previous = () => {
		if (currPageNum - 1 >= 0) {
			setSkip((currPageNum - 1) * limit);
			setCurrPageNum(currPageNum - 1);
		}
	};
	const next = () => {
		if (users.length === limit) {
			setSkip((currPageNum + 1) * limit);
			setCurrPageNum(currPageNum + 1);
		}
	};

	return (
		<Layout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell align="right">Email</TableCell>
							<TableCell align="right">Admin</TableCell>
							<TableCell align="right" />
						</TableRow>
					</TableHead>
					<TableBody>
						{users.map((profile) => {
							return (
								<TableRow
									sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
								>
									<TableCell>
										{profile.first_name} {profile.last_name}
									</TableCell>
									<TableCell align="right">{profile.email}</TableCell>
									<TableCell align="right">
										{profile.admin !== undefined && profile.admin
											? "True"
											: "False"}
									</TableCell>
									<TableCell align="left">
										{profile.admin ? (
											<Button
												color="primary"
												onClick={() => {
													revokeAdmin(profile.email);
												}}
												disabled={profile.email === currentUser.email}
											>
												Revoke
											</Button>
										) : (
											<Button
												color="primary"
												onClick={() => {
													setAdmin(profile.email);
												}}
												disabled={profile.email === currentUser.email}
											>
												Set Admin
											</Button>
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
				<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
					<ButtonGroup variant="contained" aria-label="previous next buttons">
						<Button
							aria-label="previous"
							onClick={previous}
							disabled={prevDisabled}
						>
							<ArrowBack /> Prev
						</Button>
						<Button aria-label="next" onClick={next} disabled={nextDisabled}>
							Next <ArrowForward />
						</Button>
					</ButtonGroup>
				</Box>
			</TableContainer>
		</Layout>
	);
};
