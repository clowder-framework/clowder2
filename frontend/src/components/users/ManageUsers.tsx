import React, { useEffect } from "react";
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
import { fetchAllUsers as fetchAllUsersAction } from "../../actions/user";

export const ManageUsers = (): JSX.Element => {
	const dispatch = useDispatch();
	const users = useSelector((state: RootState) => state.group.users);
	const fetchAllUsers = () => dispatch(fetchAllUsersAction());
	// component did mount
	useEffect(() => {
		fetchAllUsers();
	}, []);

	return (
		<Layout>
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell align="right">Email</TableCell>
							<TableCell align="right">Admin</TableCell>
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
										{profile.admin ? "True" : "False"}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</Layout>
	);
};
