import React, {useEffect, useState} from "react";
import {Box, Button} from "@mui/material";
import Layout from "../Layout";
import {RootState} from "../../types/data";
import {useDispatch, useSelector} from "react-redux";
import {addGroupMember, fetchGroupAbout} from "../../actions/group";
import {fetchGroupRole} from "../../actions/authorization";
import Typography from "@mui/material/Typography";
import {useParams} from "react-router-dom";
import {AuthWrapper} from "../auth/AuthWrapper";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import MembersTable from "./MembersTable";
import AddMemberModal from "./AddMemberModal";


export function Group() {

	// path parameter
	const {groupId} = useParams<{ groupId?: string }>();

	// Redux connect equivalent
	const dispatch = useDispatch();
	const fetchGroupInfo = (groupId: string | undefined) => dispatch(fetchGroupAbout(groupId));
	const fetchCurrentGroupRole = (groupId: string | undefined) => dispatch(fetchGroupRole(groupId));

	const about = useSelector((state: RootState) => state.group.about);
	const role = useSelector((state: RootState) => state.group.role);

	const [addMemberModalOpen,setAddMemberModalOpen] = useState(false);

	// component did mount
	useEffect(() => {
		fetchGroupInfo(groupId);
		fetchCurrentGroupRole(groupId);
	}, []);

	return (
		<Layout>
			<AddMemberModal open={addMemberModalOpen} handleClose={()=>{setAddMemberModalOpen(false);}}
							groupName={about.name}/>
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}>
				<Box sx={{
					display: "flex",
					flexDirection: "column",
					p: 1,
					m: 1
				}}>
					<Typography variant="h3" paragraph>{about !== undefined ? about.name : "Not found"}
					</Typography>
					<Typography variant="body1" paragraph>{about.description}</Typography>
				</Box>
				{/*<AuthWrapper currRole={role} allowedRoles={["editor"]}>*/}
				<Button variant="contained"
						onClick={() => {
							setAddMemberModalOpen(true);
						}} endIcon={<PersonAddAlt1Icon/>}>
					Add Member
				</Button>
				{/*</AuthWrapper>*/}
			</Box>
			<MembersTable groupId={groupId}/>
		</Layout>
	);
}
