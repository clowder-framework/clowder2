import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Link } from "@mui/material";
import Layout from "../Layout";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroupAbout } from "../../actions/group";
import { fetchGroupRole } from "../../actions/authorization";
import Typography from "@mui/material/Typography";
import { useParams } from "react-router-dom";
import { AuthWrapper } from "../auth/AuthWrapper";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import MembersTable from "./MembersTable";
import { EditMenu } from "./EditMenu";
import AddMemberModal from "./AddMemberModal";
import RoleChip from "../auth/RoleChip";
import { MainBreadcrumbs } from "../navigation/BreadCrumb";
import { ErrorModal } from "../errors/ErrorModal";
import DeleteGroupModal from "./DeleteGroupModal";

export function Group() {
	// path parameter
	const { groupId } = useParams<{ groupId?: string }>();

	// Redux connect equivalent
	const dispatch = useDispatch();

	const fetchGroupInfo = (groupId: string | undefined) =>
		dispatch(fetchGroupAbout(groupId));
	const fetchCurrentGroupRole = (groupId: string | undefined) =>
		dispatch(fetchGroupRole(groupId));

	const groupAbout = useSelector((state: RootState) => state.group.about);
	const deletedGroupMember = useSelector(
		(state: RootState) => state.group.deletedGroupMember
	);
	const role = useSelector((state: RootState) => state.group.role);
	const groupCreatorEmail = useSelector(
		(state: RootState) => state.group.about.creator
	);
	const adminMode = useSelector((state: RootState) => state.user.adminMode);

	const groupCreatorEmailLink = `mailto:${groupCreatorEmail}`;
	const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
	const [deleteGroupConfirmOpen, setDeleteGroupConfirmOpen] = useState(false);

	useEffect(() => {
		fetchGroupInfo(groupId);
		fetchCurrentGroupRole(groupId);
	}, [adminMode, deletedGroupMember]);

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
			<DeleteGroupModal
				deleteGroupConfirmOpen={deleteGroupConfirmOpen}
				setDeleteGroupConfirmOpen={setDeleteGroupConfirmOpen}
				groupId={groupAbout.id}
			/>
			{/*Header & menus*/}
			<Grid container>
				<Grid
					item
					xs={12}
					sm={12}
					md={8}
					lg={9}
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
				</Grid>

				{/*Buttons*/}
				<Grid
					item
					xs={12}
					sm={12}
					md={4}
					lg={3}
					sx={{
						display: "flex",
						justifyContent: "flex-start",
						alignItems: "baseline",
						flexDirection: "row",
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
							sx={{ marginRight: "0.5em", width: "auto" }}
						>
							Add Member
						</Button>
					</AuthWrapper>
					<AuthWrapper currRole={role} allowedRoles={["owner", "editor"]}>
						<EditMenu setDeleteGroupConfirmOpen={setDeleteGroupConfirmOpen} />
					</AuthWrapper>
				</Grid>
			</Grid>
			<MembersTable groupId={groupId} />
		</Layout>
	);
}
