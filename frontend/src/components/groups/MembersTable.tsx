import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../types/data";
import {theme} from "../../theme";
import {MembersTableUserEntry} from "./MembersTableUserEntry";
import {ActionModal} from "../dialog/ActionModal";
import {useState} from "react";
import {deleteGroupMember} from "../../actions/group";

type MembersTableProps = {
	groupId: string | undefined,
}

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main
}

export default function MembersTable(props: MembersTableProps) {

	const {groupId} = props;

	// mapStateToProps
	const about = useSelector((state: RootState) => state.group.about);

	// dispatch
	const dispatch = useDispatch();
	const groupMemberDeleted = (groupId: string|undefined, username: string|undefined) => dispatch(deleteGroupMember(groupId, username))

	// use history hook to redirect/navigate between routes
	const [deleteDatasetConfirmOpen, setDeleteDatasetConfirmOpen] = useState(false);
	const [selectMemberUsername, setSelectMemberUsername] = useState();

	return (
		<>
			<ActionModal actionOpen={deleteDatasetConfirmOpen} actionTitle="Are you sure?"
							 actionText="Do you really want to delete this member? This process cannot be undone."
							 actionBtnName="Delete" handleActionBtnClick={() => groupMemberDeleted(groupId, selectMemberUsername)}
							 handleActionCancel={() => {
								 setDeleteDatasetConfirmOpen(false);
							 }}/>
			<TableContainer component={Paper}>
				<Table sx={{minWidth: 650}} aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell align="right">Email</TableCell>
							<TableCell align="right">Role</TableCell>
							<TableCell align="right"></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{
							about !== undefined && about.users !== undefined ?
								(about.users.map((member) => (
									<MembersTableUserEntry
										iconStyle={iconStyle}
										member={member}
										key={member.user.id}
										setDeleteDatasetConfirmOpen={setDeleteDatasetConfirmOpen}
										setSelectMemberUsername={setSelectMemberUsername}
									/>
								)))
								:
								<></>
						}
					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
}
