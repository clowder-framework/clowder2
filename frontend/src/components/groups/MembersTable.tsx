import * as React from "react";
import { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { MembersTableUserEntry } from "./MembersTableUserEntry";
import { ActionModal } from "../dialog/ActionModal";
import { deleteGroupMember } from "../../actions/group";

type MembersTableProps = {
	groupId: string | undefined;
};

export default function MembersTable(props: MembersTableProps) {
	const { groupId } = props;

	// mapStateToProps
	const groupAbout = useSelector((state: RootState) => state.group.about);
	const groupCreatorEmail = useSelector(
		(state: RootState) => state.group.about.creator
	);
	// dispatch
	const dispatch = useDispatch();

	const groupMemberDeleted = (
		groupId: string | undefined,
		username: string | undefined
	) => dispatch(deleteGroupMember(groupId, username));

	const [deleteMemberConfirmOpen, setDeleteMemberConfirmOpen] = useState(false);
	const [selectMemberUsername, setSelectMemberUsername] = useState();

	return (
		<>
			<ActionModal
				actionOpen={deleteMemberConfirmOpen}
				actionTitle="Are you sure?"
				actionText="Do you really want to delete this member? This process cannot be undone."
				actionBtnName="Delete"
				handleActionBtnClick={() => {
					groupMemberDeleted(groupId, selectMemberUsername);
					setDeleteMemberConfirmOpen(false);
				}}
				handleActionCancel={() => {
					setDeleteMemberConfirmOpen(false);
				}}
				actionLevel={"error"}
			/>
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell align="right">Email</TableCell>
							<TableCell align="right">Role</TableCell>
							<TableCell align="right" />
						</TableRow>
					</TableHead>
					<TableBody>
						{groupAbout !== undefined && groupAbout.users !== undefined ? (
							groupAbout.users.map((member) => (
								<MembersTableUserEntry
									groupId={groupId}
									member={member}
									creatorEmail={groupCreatorEmail}
									key={member.user.id}
									setDeleteMemberConfirmOpen={setDeleteMemberConfirmOpen}
									setSelectMemberUsername={setSelectMemberUsername}
								/>
							))
						) : (
							<></>
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
}
