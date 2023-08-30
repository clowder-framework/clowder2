import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Link } from "@mui/material";
import Layout from "../Layout";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import { deleteGroup, fetchGroupAbout } from "../../actions/group";
import { fetchGroupRole } from "../../actions/authorization";
import Typography from "@mui/material/Typography";
import { useNavigate, useParams } from "react-router-dom";
import { AuthWrapper } from "../auth/AuthWrapper";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import MembersTable from "./MembersTable";
import { EditMenu } from "./EditMenu";
import AddMemberModal from "./AddMemberModal";
import EditNameModal from "./EditNameModal";
import RoleChip from "../auth/RoleChip";
import DeleteIcon from "@mui/icons-material/Delete";
import { MainBreadcrumbs } from "../navigation/BreadCrumb";
import { config } from "../../app.config";
import { ErrorModal } from "../errors/ErrorModal";

export function Group() {
	// path parameter
	const { groupId } = useParams<{ groupId?: string }>();

	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	// Redux connect equivalent
	const dispatch = useDispatch();
	const fetchGroupInfo = (groupId: string | undefined) =>
		dispatch(fetchGroupAbout(groupId));
	const fetchCurrentGroupRole = (groupId: string | undefined) =>
		dispatch(fetchGroupRole(groupId));
	const groupDeleted = (groupId: string | undefined) =>
		dispatch(deleteGroup(groupId));

	const groupAbout = useSelector((state: RootState) => state.group.about);

	const role = useSelector((state: RootState) => state.group.role);

	const groupCreatorEmail = useSelector(
		(state: RootState) => state.group.about.creator
	);
	const groupCreatorEmailLink = "mailto:" + groupCreatorEmail;
	const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
	const [editNameModalOpen, setEditNameModalOpen] = useState(false);
	const [deleteGroupConfirmOpen, setDeleteGroupConfirmOpen] = useState(false);

	// component did mount
	useEffect(() => {
		fetchGroupInfo(groupId);
		fetchCurrentGroupRole(groupId);
	}, []);

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);

	// for breadcrumb
	const paths = [
		{
			name: "Groups",
			url: "/groups",
		},
		{
			name: groupAbout.name,
			url: `/groups/${groupAbout.name}`,
		},
	];

	return (
		<Layout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />
			{/*breadcrumb*/}
			<Grid container>
				<Grid item xs={10} sx={{ display: "flex", alignItems: "center" }}>
					<MainBreadcrumbs paths={paths} />
				</Grid>
			</Grid>
			<AddMemberModal
				open={addMemberModalOpen}
				handleClose={() => {
					setAddMemberModalOpen(false);
				}}
				groupOwner={groupCreatorEmail}
				groupName={groupAbout.name}
				groupId={groupAbout.id}
			/>
			<EditNameModal
				open={editNameModalOpen}
				groupOwner={groupCreatorEmail}
				handleClose={() => {
					setEditNameModalOpen(false);
				}}
				groupName={groupAbout.name}
				groupId={groupAbout.id}
			/>

			{/*Header & menus*/}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "flex-start",
						alignItems: "baseline",
					}}
				>
					<Box sx={{ display: "flex", flexDirection: "column" }}>
						<Box
							sx={{
								display: "flex",
								flexDirection: "flex-start",
								alignItems: "baseline",
							}}
						>
							<Typography variant="h3" paragraph>
								{groupAbout !== undefined ? groupAbout.name : "Not found"}
							</Typography>
							<RoleChip role={role} />
						</Box>
						<Typography variant="body1" paragraph>
							{groupAbout.description}
						</Typography>
						<Typography variant="body1" paragraph>
							<strong>Creator: </strong>
							<Link href={groupCreatorEmailLink}>{groupCreatorEmail}</Link>
						</Typography>
					</Box>
				</Box>

				{/*Buttons*/}
				<Box
					sx={{
						display: "flex",
						justifyContent: "flex-start",
						alignItems: "baseline",
					}}
				>
					{/*only owner or editor are allowed to edit*/}
					<AuthWrapper currRole={role} allowedRoles={["owner", "editor"]}>
						<Button
							variant="contained"
							onClick={() => {
								setAddMemberModalOpen(true);
							}}
							endIcon={<PersonAddAlt1Icon />}
						>
							Add Member
						</Button>
					</AuthWrapper>
					<AuthWrapper currRole={role} allowedRoles={["owner", "editor"]}>
						<EditMenu
							groupOwner={groupCreatorEmail}
							groupName={groupAbout.name}
							groupId={groupId}
						/>
					</AuthWrapper>

					{/*<AuthWrapper currRole={role} allowedRoles={["owner"]}>*/}
					{/*	<Button*/}
					{/*		variant="outlined"*/}
					{/*		onClick={() => {*/}
					{/*			setEditNameModalOpen(true);*/}
					{/*		}}*/}
					{/*		endIcon={<DriveFileRenameOutline fontSize="small"/>}*/}
					{/*		sx={{ marginLeft: "0.5em" }}*/}
					{/*	>*/}
					{/*		Edit Name*/}
					{/*	</Button>*/}
					{/*</AuthWrapper>*/}
					{/*only owner are allowed to delete*/}
					<AuthWrapper currRole={role} allowedRoles={["owner"]}>
						<Button
							variant="outlined"
							onClick={() => {
								setDeleteGroupConfirmOpen(true);
							}}
							endIcon={<DeleteIcon />}
							sx={{ marginLeft: "0.5em" }}
						>
							Delete Group
						</Button>
					</AuthWrapper>
				</Box>
			</Box>
			<MembersTable groupId={groupId} />
		</Layout>
	);
}
