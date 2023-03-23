import React from "react";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import PersonIcon from "@mui/icons-material/Person";
import {Button} from "@mui/material";
import {Member} from "../../openapi/v2";
import MemberMenu from "./MemberMenu";


type MembersTableUserEntryProps = {
	iconStyle: {}
	member: Member
}

export function MembersTableUserEntry(props: MembersTableUserEntryProps) {

	const {iconStyle, member} = props;

	return (
		<TableRow
			key={member.user.id}
			sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
		>
			<TableCell component="th" scope="row" key={`${member.user.id}-icon`}>
				<PersonIcon sx={iconStyle}/>
				<Button >{member.user.first_name} {member.user.last_name}</Button>
			</TableCell>
			<TableCell align="right">{member.user.email}</TableCell>
			<TableCell align="right">{member.editor !== undefined && member.editor ? "Editor" : "Member"}</TableCell>
			<TableCell align="right"><MemberMenu member={member}/></TableCell>
		</TableRow>
	)
}
