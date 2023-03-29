import React, {useState} from "react";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import PersonIcon from "@mui/icons-material/Person";
import {Button, IconButton} from "@mui/material";
import {Member} from "../../openapi/v2";
import MemberMenu from "./MemberMenu";
import {SearchOutlined} from "@material-ui/icons";
import DeleteIcon from "@mui/icons-material/Delete";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../types/data";
import {ActionModal} from "../dialog/ActionModal";


type MembersTableUserEntryProps = {
	iconStyle: {}
	member: Member
}

export function MembersTableUserEntry(props: MembersTableUserEntryProps) {

	const {iconStyle, member} = props;

	const groupRole = useSelector((state: RootState) => state.group.role);

	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [updateFileOpen, setUpdateFileOpen] = useState(false);


	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
	};

	// confirmation dialog
	const dispatch = useDispatch();

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
			<TableCell align="right">
				<IconButton type="button" sx={{p: "10px"}} aria-label="delete" onClick={handleClick}>
					<DeleteIcon/>
				</IconButton>
			</TableCell>
		</TableRow>
	)
}
