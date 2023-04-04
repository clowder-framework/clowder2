import React, {useEffect, useState} from "react";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import PersonIcon from "@mui/icons-material/Person";
import {Button, FormControl, IconButton, InputLabel, MenuItem, Select} from "@mui/material";
import {Member} from "../../openapi/v2";
import DeleteIcon from "@mui/icons-material/Delete";
import {theme} from "../../theme";
import Gravatar from "react-gravatar";
import {AuthWrapper} from "../auth/AuthWrapper";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../types/data";
import {assignGroupMemberRole, deleteGroupMember} from "../../actions/group";
import EditIcon from "@mui/icons-material/Edit"

type MembersTableUserEntryProps = {
	groupId: string
	member: Member
	setDeleteDatasetConfirmOpen: any
	setSelectMemberUsername: any
}

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main,
}


export function MembersTableUserEntry(props: MembersTableUserEntryProps) {

	const {groupId, member, setDeleteDatasetConfirmOpen, setSelectMemberUsername} = props;

	const dispatch = useDispatch();
	const groupMemberRoleAssigned = (groupId: string|undefined, username: string|undefined,
									 role: string|undefined) => dispatch(assignGroupMemberRole(groupId, username, role));
	const role = useSelector((state: RootState) => state.group.role);

	const [selectedRole, setSelectedRole] = useState(member.editor ? "editor": "member");
	const [editRoleOn, setEditRoleOn] = useState(false);

	// if any thing updated in redux, reflect on the selected member
	useEffect(() => {
		setSelectedRole(member.editor ? "editor" : "member");
	}, [member]);

	const handleRoleSelection = (e) => {
		setSelectedRole(e.target.value);
	};

	// Resume to the current state in redux
	const handleRoleCancel = () => {
		setSelectedRole(member.editor ? "editor" : "member");
		setEditRoleOn(false);
	};

	const handleRoleSave = () => {
		groupMemberRoleAssigned(groupId, member.user.email, selectedRole);
		setEditRoleOn(false);
	};

	return (
		<TableRow
			key={member.user.id}
			sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
		>
			<TableCell component="th" scope="row" key={`${member.user.id}-icon`}>
				{
					member && member.user && member.user.email ?
						<Gravatar email={member.user.email} rating="g"
							  style={{width: "32px", height: "32px", borderRadius: "50%", verticalAlign: "middle"}}/>
						:
						<PersonIcon sx={iconStyle}/>
				}
				<Button >{member.user.first_name} {member.user.last_name}</Button>
			</TableCell>
			<TableCell align="right">{member.user.email}</TableCell>
			<TableCell align="right">
				{
					editRoleOn?
						<FormControl fullWidth>
							  <InputLabel id="demo-simple-select-label">Role</InputLabel>
							  <Select
								labelId="role"
								id="role"
								value={selectedRole}
								label="Role"
								onChange={handleRoleSelection}
							  >
								<MenuItem value={"editor"}>Editor</MenuItem>
								<MenuItem value={"member"}>Member</MenuItem>
							  </Select>
							</FormControl>
						:
						member.editor !== undefined && member.editor ?
							"Editor" : "Member"
				}
				<IconButton type="button" sx={{p: "10px"}} aria-label="edit" onClick={()=>{
						setEditRoleOn(true);
					}}>
						<EditIcon sx={iconStyle} />
				</IconButton>
			</TableCell>
			<TableCell align="right">
				<AuthWrapper currRole={role} allowedRoles={["owner", "editor"]}>
					<IconButton type="button" sx={{p: "10px"}} aria-label="delete" onClick={()=>{
						setSelectMemberUsername(member.user.email)
						setDeleteDatasetConfirmOpen(true);
					}}>
						<DeleteIcon sx={iconStyle}/>
					</IconButton>
				</AuthWrapper>
			</TableCell>
		</TableRow>
	)
}
