import React from "react";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { GroupAndRoleSubTableEntry } from "./GroupAndRoleSubTableEntry";
import { GroupOut } from "../../openapi/v2";

type GroupAndRoleSubTableProps = {
	group: GroupOut;
};

export function GroupAndRoleSubTable(props: GroupAndRoleSubTableProps) {
	const { group } = props;

	return (
		<TableContainer>
			<Table
				sx={{
					minWidth: 650,
					backgroundColor: "#EEEEEE",
				}}
				aria-label="simple table"
			>
				<TableHead>
					<TableRow>
						<TableCell />
						<TableCell align="right">Name</TableCell>
						<TableCell align="right">Email</TableCell>
						<TableCell align="right" />
					</TableRow>
				</TableHead>
				<TableBody>
					{group.users !== undefined ? (
						group.users.map((member) => (
							<GroupAndRoleSubTableEntry user={member.user} />
						))
					) : (
						<></>
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
