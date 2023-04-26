import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useParams, useSearchParams } from "react-router-dom";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../Layout";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {fetchUserProfile} from "../../actions/user";

export const Profile = (): JSX.Element => {
	const dispatch = useDispatch();
	const user = useSelector((state: RootState) => state.user);
	const profile = user["profile"];
	const fetchProfile = () => dispatch(fetchUserProfile());
	console.log('user is');
	console.log(user);
	// component did mount
	useEffect(() => {
		fetchProfile();
		console.log(user.profile);
	}, []);

	console.log('profile is', profile);
	return (
			<Layout>
				<TableContainer component={Paper}>
					<Table sx={{minWidth: 650}} aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell align="right">Email</TableCell>
								<TableCell align="right">Admin</TableCell>
								<TableCell align="right"></TableCell>
							</TableRow>
						</TableHead>
							<TableBody>
								<TableRow
									sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
		>
									<TableCell>{"name"}</TableCell>
									<TableCell align="right">{"a@a.com"}</TableCell>
									<TableCell align="right">{"false"}</TableCell>
								</TableRow>
							</TableBody>
					</Table>
				</TableContainer>
			</Layout>
	)

}
