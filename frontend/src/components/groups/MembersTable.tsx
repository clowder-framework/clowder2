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
import {datasetDeleted} from "../../actions/dataset";
import {deleteGroupMember} from "../../actions/group";

type MembersTableProps = {
	groupId: string | undefined,
}

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main
}

export default function MembersTable(props: MembersTableProps) {
	const dispatch = useDispatch();

	// mapStateToProps
	const about = useSelector((state: RootState) => state.group.about);

	// use history hook to redirect/navigate between routes
	const [deleteDatasetConfirmOpen, setDeleteDatasetConfirmOpen] = useState(false);
	const groupMemberDeleted = (groupId: string, username: string) => dispatch(deleteGroupMember(groupId, username))

	return (
		<>
			<ActionModal actionOpen={deleteDatasetConfirmOpen} actionTitle="Are you sure?"
							 actionText="Do you really want to delete this dataset? This process cannot be undone."
							 actionBtnName="Delete" handleActionBtnClick={groupMemberDeleted}
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
