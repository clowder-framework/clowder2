import React from "react";
import { RootState } from "../../types/data";
import { useSelector } from "react-redux";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { GroupAndRoleTableEntry } from "./GroupAndRoleTableEntry";

export const GroupAndRoleTable = (): JSX.Element => {
	const datasetRolesList = useSelector(
		(state: RootState) => state.dataset.roles
	);

	return (
		<TableContainer>
			<Table sx={{ minWidth: 650 }} aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell>Group Name</TableCell>
						<TableCell align="right">Member Count</TableCell>
						<TableCell align="right">Role</TableCell>
						<TableCell align="right" />
					</TableRow>
				</TableHead>
				<TableBody>
					{datasetRolesList !== undefined &&
					datasetRolesList.group_roles !== undefined ? (
						datasetRolesList.group_roles.map((group_role) => (
							<GroupAndRoleTableEntry group_role={group_role} />
						))
					) : (
						<></>
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
};
