import React, {useEffect, useState} from "react";
import {Box, Button, Grid} from "@mui/material";
import Layout from "../Layout";
import {RootState} from "../../types/data";
import { ListItem } from '@mui/material';
import {useDispatch, useSelector} from "react-redux";
import {deleteGroup, fetchGroupAbout} from "../../actions/group";
import {fetchGroupRole} from "../../actions/authorization";
import Typography from "@mui/material/Typography";
import {useNavigate, useParams} from "react-router-dom";
import {AuthWrapper} from "../auth/AuthWrapper";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import MembersTable from "./MembersTable";
import AddMemberModal from "./AddMemberModal";
import RoleChip from "../auth/RoleChip";
import DeleteIcon from "@mui/icons-material/Delete";
import {ActionModal} from "../dialog/ActionModal";
import { MainBreadcrumbs } from "../navigation/BreadCrumb";


export function Group() {

	// path parameter
	const {groupId} = useParams<{ groupId?: string }>();

	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	// Redux connect equivalent
	const dispatch = useDispatch();
	const fetchGroupInfo = (groupId: string | undefined) => dispatch(fetchGroupAbout(groupId));
	const fetchCurrentGroupRole = (groupId: string | undefined) => dispatch(fetchGroupRole(groupId));
	const groupDeleted = (groupId: string | undefined) => dispatch(deleteGroup(groupId));

	const groupAbout = useSelector((state: RootState) => state.group.about);

	const role = useSelector((state: RootState) => state.group.role);

	const groupCreatorEmail =  useSelector((state: RootState) => state.group.about.creator);
	const groupCreatorEmailLink = "mailto:"+groupCreatorEmail;
	const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
	const [deleteGroupConfirmOpen, setDeleteGroupConfirmOpen] = useState(false);

	// component did mount
	useEffect(() => {
		fetchGroupInfo(groupId);
		fetchCurrentGroupRole(groupId);
	}, []);

 	// for breadcrumb
	const paths = [
		{
			"name": "Explore",
			"url": "/",
		},
		{
			"name": "Groups",
			"url": "/groups"
		},
		{
			"name": groupAbout.name,
			"url": `/groups/${groupAbout.name}`
		}
	];

	return (
		<Layout>
 	           	{/*breadcrumb*/}
			<Grid container>
				<Grid item xs={10} sx={{display: "flex", alignItems: "center"}}>
					<MainBreadcrumbs paths={paths}/>
				</Grid>
			</Grid>
			{/*Delete group modal*/}
			<ActionModal actionOpen={deleteGroupConfirmOpen} actionTitle="Are you sure?"
						 actionText="Do you really want to delete this group? This process cannot be undone."
						 actionBtnName="Delete"
						 handleActionBtnClick={() => {
							 groupDeleted(groupId);
							 setDeleteGroupConfirmOpen(false);
							 // Go to Explore page
							 history("/");
						 }}
						 handleActionCancel={() => {
							 setDeleteGroupConfirmOpen(false);
						 }}/>
			<AddMemberModal open={addMemberModalOpen} handleClose={() => {setAddMemberModalOpen(false);}}
				groupName={groupAbout.name} groupId={groupAbout.id}/>
			<Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
				<Box sx={{display: "flex", justifyContent: "flex-start", alignItems: "baseline"}}>
					<Box sx={{ display: "flex", flexDirection: "column"}}>
						<Box sx={{ display: "flex", flexDirection: "flex-start", alignItems: "baseline"}}>
							<Typography variant="h3" paragraph>
								{groupAbout !== undefined ? groupAbout.name : "Not found"}
							</Typography>
							<RoleChip role={role}/>
						</Box>
						<Typography variant="body1" paragraph>{groupAbout.description}</Typography>
						<Typography variant="body1" paragraph><strong>Creator: </strong>
   							<Button >{groupCreatorEmail}</Button>
						</Typography>
					</Box>

				</Box>

				{/*Buttons*/}
				<Box sx={{display: "flex", justifyContent: "flex-start", alignItems: "baseline"}}>
					{/*only owner or editor are allowed to edit*/}
					<AuthWrapper currRole={role} allowedRoles={["owner", "editor"]}>
						<Button variant="contained"
							onClick={() => {
								setAddMemberModalOpen(true);
							}} endIcon={<PersonAddAlt1Icon/>}>
							Add Member
						</Button>
					</AuthWrapper>
					{/*only owner are allowed to delete*/}
					<AuthWrapper currRole={role} allowedRoles={["owner"]}>
						<Button variant="outlined"
							onClick={() => {
								setDeleteGroupConfirmOpen(true);
							}} endIcon={<DeleteIcon/>}
							sx={{marginLeft:"0.5em"}}>
							Delete Group
						</Button>
					</AuthWrapper>
				</Box>
			</Box>
			<MembersTable groupId={groupId}/>
		</Layout>
	);
}
