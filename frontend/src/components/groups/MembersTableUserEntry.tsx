import React, { useEffect, useState } from "react";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import PersonIcon from "@mui/icons-material/Person";
import {
	ButtonGroup,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
} from "@mui/material";
import { Member } from "../../openapi/v2";
import DeleteIcon from "@mui/icons-material/Delete";
import { theme } from "../../theme";
import Gravatar from "react-gravatar";
import { AuthWrapper } from "../auth/AuthWrapper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { assignGroupMemberRole } from "../../actions/group";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

type MembersTableUserEntryProps = {
	groupId: string | undefined;
	member: Member;
	creatorEmail: string | undefined;
	setDeleteMemberConfirmOpen: any;
	setSelectMemberUsername: any;
};

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main,
};

export function MembersTableUserEntry(props: MembersTableUserEntryProps) {
	const {
		groupId,
		member,
		creatorEmail,
		setDeleteMemberConfirmOpen,
		setSelectMemberUsername,
	} = props;

	const dispatch = useDispatch();
	const groupMemberRoleAssigned = (
		groupId: string | undefined,
		username: string | undefined,
		role: string | undefined
	) => dispatch(assignGroupMemberRole(groupId, username, role));
	const role = useSelector((state: RootState) => state.group.role);

	const [selectedRole, setSelectedRole] = useState(
		member.editor ? "editor" : "member"
	);
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
				{member && member.user && member.user.email ? (
					<Gravatar
						email={member.user.email}
						rating="g"
						style={{
							width: "32px",
							height: "32px",
							borderRadius: "50%",
							verticalAlign: "middle",
							marginRight: "1em",
						}}
					/>
				) : (
					<PersonIcon
						sx={{
							verticalAlign: "middle",
							marginRight: "1em",
						}}
					/>
				)}
				{member.user.first_name} {member.user.last_name}
			</TableCell>
			<TableCell align="right">{member.user.email}</TableCell>
			{member.user.email == creatorEmail && (
				<TableCell align="right">{"Owner"}</TableCell>
			)}
			{member.user.email != creatorEmail && (
				<TableCell align="right">
					{editRoleOn ? (
						<FormControl size="small">
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
					) : member.editor !== undefined && member.editor ? (
						"Editor"
					) : (
						"Member"
					)}
					{/*only owner or editor are allowed to modify roles of the member*/}
					<AuthWrapper currRole={role} allowedRoles={["owner", "editor"]}>
						{editRoleOn ? (
							<ButtonGroup variant="text">
								<IconButton
									type="button"
									sx={{ p: "10px" }}
									onClick={handleRoleSave}
								>
									<CheckIcon sx={iconStyle} />
								</IconButton>
								<IconButton
									type="button"
									sx={{ p: "10px" }}
									onClick={handleRoleCancel}
								>
									<CloseIcon sx={iconStyle} />
								</IconButton>
							</ButtonGroup>
						) : (
							<IconButton
								type="button"
								sx={{ p: "10px" }}
								aria-label="edit"
								onClick={() => {
									setEditRoleOn(true);
								}}
							>
								<EditIcon sx={iconStyle} />
							</IconButton>
						)}
					</AuthWrapper>
				</TableCell>
			)}
			{member.user.email == creatorEmail && <TableCell align="right" />}
			{member.user.email != creatorEmail && (
				<TableCell align="right">
					{/*only owner or editor are allowed to delete*/}
					<AuthWrapper currRole={role} allowedRoles={["owner", "editor"]}>
						<IconButton
							type="button"
							sx={{ p: "10px" }}
							aria-label="delete"
							onClick={() => {
								setSelectMemberUsername(member.user.email);
								setDeleteMemberConfirmOpen(true);
							}}
						>
							<DeleteIcon sx={iconStyle} />
						</IconButton>
					</AuthWrapper>
				</TableCell>
			)}
		</TableRow>
	);
}
