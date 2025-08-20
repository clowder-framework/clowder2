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
import { fetchUserProfile } from "../../actions/user";

export const Profile = (): JSX.Element => {
	const dispatch = useDispatch();
	const profile = useSelector((state: RootState) => state.user.profile);
	const fetchProfile = () => dispatch(fetchUserProfile());
	// component did mount
	useEffect(() => {
		fetchProfile();
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
							<TableCell align="right">Read Only</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
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
							<TableCell align="right">
								{profile.read_only_user ? "True" : "False"}
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</TableContainer>
		</Layout>
	);
};
