import React, { useEffect, useState } from "react";
import { Box, Grid } from "@mui/material";
import Layout from "../Layout";
import { useDispatch } from "react-redux";
import Typography from "@mui/material/Typography";
import { useParams } from "react-router-dom";
import { MainBreadcrumbs } from "../navigation/BreadCrumb";
import { ErrorModal } from "../errors/ErrorModal";

export function MetadataDefinitionEntry() {
	// path parameter
	const { metadataDefinitionId } = useParams<{
		metadataDefinitionId?: string;
	}>();

	// Redux connect equivalent
	const dispatch = useDispatch();
	// const fetchGroupInfo = (groupId: string | undefined) =>
	// 	dispatch(fetch(groupId));
	// const fetchCurrentGroupRole = (groupId: string | undefined) =>
	// 	dispatch(fetchGroupRole(groupId));
	//
	// const groupAbout = useSelector((state: RootState) => state.group.about);
	//
	// const role = useSelector((state: RootState) => state.group.role);
	//
	// const groupCreatorEmail = useSelector(
	// 	(state: RootState) => state.group.about.creator
	// );
	// const groupCreatorEmailLink = `mailto:${groupCreatorEmail}`;
	// const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
	// const [deleteGroupConfirmOpen, setDeleteGroupConfirmOpen] = useState(false);

	// component did mount
	useEffect(() => {
		// fetchGroupInfo(groupId);
		// fetchCurrentGroupRole(groupId);
	}, []);

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);

	// for breadcrumb
	const paths = [
		{
			name: "Metadata Definitions",
			url: "/metadata-definitions",
		},
		// {
		// 	name: groupAbout.name,
		// 	url: `/groups/${groupAbout.name}`,
		// },
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
			{/*<DeleteGroupModal*/}
			{/*	deleteGroupConfirmOpen={deleteGroupConfirmOpen}*/}
			{/*	setDeleteGroupConfirmOpen={setDeleteGroupConfirmOpen}*/}
			{/*	groupId={groupAbout.id}*/}
			{/*/>*/}
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
								{/*{groupAbout !== undefined ? groupAbout.name : "Not found"}*/}
							</Typography>
						</Box>
						<Typography variant="body1" paragraph>
							{/*{groupAbout.description}*/}
						</Typography>
						<Typography variant="body1" paragraph>
							{/*<strong>Creator: </strong>*/}
							{/*<Link href={groupCreatorEmailLink}>{groupCreatorEmail}</Link>*/}
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
					{/*<AuthWrapper currRole={role} allowedRoles={["owner", "editor"]}>*/}
					{/*	<EditMenu setDeleteGroupConfirmOpen={setDeleteGroupConfirmOpen} />*/}
					{/*</AuthWrapper>*/}
				</Grid>
			</Grid>
		</Layout>
	);
}
