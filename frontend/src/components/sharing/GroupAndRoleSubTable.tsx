import React from "react";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import { GroupAndRoleSubTableEntry } from "./GroupAndRoleSubTableEntry";
import { GroupOut } from "../../openapi/v2";
import { TableRow } from "@mui/material";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";

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
					fontSize: "0.8rem",
				}}
				size="small"
				aria-label="group and roles table"
			>
				<TableHead>
					<TableRow>
						<TableCell />
						<TableCell>Member Name</TableCell>
						<TableCell align="right">Member Email</TableCell>
						<TableCell align="right" />
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
