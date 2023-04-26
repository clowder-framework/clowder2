import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useParams, useSearchParams } from "react-router-dom";
import { RootState } from "../../types/data";
import {useSelector} from "react-redux";
import Layout from "../Layout";

export const Profile = (): JSX.Element => {
	const user = useSelector((state: RootState) => state.user);
	console.log('user is');
	console.log(user);
	return (
		<Layout>
			<>profile would go here</>
		</Layout>
	)

}
