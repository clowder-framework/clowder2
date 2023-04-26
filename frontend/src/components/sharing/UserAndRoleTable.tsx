import React from "react";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { theme } from "../../theme";
import { UserAndRoleTableEntry } from "./UserAndRoleTableEntry";

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main,
};

export const UserAndRoleTable = (): JSX.Element => {
	const { datasetId } = useParams<{ datasetId?: string }>();

	const dispatch = useDispatch();

	const datasetRolesList = useSelector(
		(state: RootState) => state.dataset.roles
	);

	return (
		<TableContainer>
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
					{datasetRolesList !== undefined &&
					datasetRolesList.user_roles !== undefined ? (
						datasetRolesList.user_roles.map((user_role) => (
							// If user is in a group, omit from this table
							<UserAndRoleTableEntry user_role={user_role} />
						))
					) : (
						<></>
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
};
