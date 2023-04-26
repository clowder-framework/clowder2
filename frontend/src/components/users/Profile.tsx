import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useParams, useSearchParams } from "react-router-dom";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../Layout";
import {fetchFolderPath} from "../../actions/folder";
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
			<>profile would go here</>
		</Layout>
	)

}
