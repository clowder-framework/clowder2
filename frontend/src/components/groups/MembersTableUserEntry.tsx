import React from "react";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import PersonIcon from "@mui/icons-material/Person";
import {Button, IconButton} from "@mui/material";
import {Member} from "../../openapi/v2";
import DeleteIcon from "@mui/icons-material/Delete";
import {theme} from "../../theme";
import Gravatar from "react-gravatar";


type MembersTableUserEntryProps = {
	iconStyle: {}
	member: Member
	setDeleteDatasetConfirmOpen: any
	setSelectMemberUsername: any
}

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main,
}


export function MembersTableUserEntry(props: MembersTableUserEntryProps) {

	const {member, setDeleteDatasetConfirmOpen, setSelectMemberUsername} = props;

	return (
		<TableRow
			key={member.user.id}
			sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
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
			<TableCell align="right">{member.editor !== undefined && member.editor ? "Editor" : "Member"}</TableCell>
			<TableCell align="right">
				<IconButton type="button" sx={{p: "10px"}} aria-label="delete" onClick={()=>{
					setSelectMemberUsername(member.user.email)
					setDeleteDatasetConfirmOpen(true);
				}}>
					<DeleteIcon sx={iconStyle}/>
				</IconButton>
			</TableCell>
		</TableRow>
	)
}
