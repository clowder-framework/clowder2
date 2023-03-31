import React, {useEffect, useState} from "react";
import {
	Box,
	Button,
	ButtonGroup, CardActionArea,
	Divider,
	Grid,
	List,
} from "@mui/material";
import Layout from "../Layout";
import {RootState} from "../../types/data";
import {useDispatch, useSelector} from "react-redux";
import {fetchGroupAbout} from "../../actions/group";
import {fetchGroupRole} from "../../actions/authorization";
import {ArrowBack, ArrowForward} from "@material-ui/icons";
import Typography from '@mui/material/Typography';
import {theme} from "../../theme";
import {Link, useParams} from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import RoleChip from "../auth/RoleChip";
import FilesTable from "../files/FilesTable";
import MembersTable from "./MembersTable";


export function Group() {

	// path parameter
	const {groupId} = useParams<{ groupId?: string }>();

	// Redux connect equivalent
	const dispatch = useDispatch();
	const fetchGroupInfo = (groupId: string | undefined) => dispatch(fetchGroupAbout(groupId));
	const fetchCurrentGroupRole = (groupId: string | undefined) => dispatch(fetchGroupRole(groupId));

	const about = useSelector((state: RootState) => state.group.about);
	const role = useSelector((state: RootState) => state.group.role);

	// component did mount
	useEffect(() => {
		fetchGroupInfo(groupId);
		fetchCurrentGroupRole(groupId);
	}, []);

	return (
		<Layout>
			<Grid container>
				{/*title*/}
				<Grid item xs={8} sx={{display: "flex", alignItems: "center"}}>
					<Box sx={{display: "inline-flex", justifyContent: "space-between", alignItems: "baseline"}}>
						<Typography variant="h3" paragraph>{about !== undefined ? about.name : "Not found"}</Typography>
					</Box>
				</Grid>
				<Grid container spacing={2}>
					<Grid item xs={10}>
						<Typography variant="body1" paragraph>{about.description}</Typography>
					</Grid>
				</Grid>
			</Grid>
			<Grid container>
				<MembersTable groupId={groupId}/>
			</Grid>
		</Layout>
	);
}
