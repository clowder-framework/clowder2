import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {useSelector} from "react-redux";
import {RootState} from "../../types/data";
import {useNavigate} from "react-router-dom";
import {Button} from "@mui/material";
import FolderIcon from '@mui/icons-material/Folder';
import {theme} from "../../theme";
import {MembersTableUserEntry} from "./MembersTableUserEntry";

type MembersTableProps = {
	groupId: string | undefined,
}

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main
}

export default function MembersTable(props: MembersTableProps) {
	// mapStateToProps
	const about = useSelector((state: RootState) => state.group.about);

	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	return (
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
	);
}
