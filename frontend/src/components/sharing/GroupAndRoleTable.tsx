import React, {useEffect, useState} from "react";
import {RootState} from "../../types/data";
import {fetchDatasetRoles} from "../../actions/dataset";
import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
//import GroupAndRoleTableEntry from "./GroupAndRoleTableEntry"


export const GroupAndRoleTable = (): JSX.Element => {

	const {datasetId} = useParams<{ datasetId?: string }>();

	const dispatch = useDispatch();

	const datasetRole = useSelector((state: RootState) => state.dataset.datasetRole);
	const datasetRolesList = useSelector((state: RootState) => state.dataset.roles);
	const [sharePaneOpen, setSharePaneOpen] = useState(false);

	const handleShareClose = () => {
        setSharePaneOpen(false);
    }

	const clickButton = () => {
		// reset error message and close the error window
		console.log('change role now');
	}

	return (
		<TableContainer>
			<Table sx={{minWidth: 650}} aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell>Group Name</TableCell>
						<TableCell align="right">Role</TableCell>
						<TableCell align="right"></TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{
						datasetRolesList !== undefined && datasetRolesList.group_roles  !== undefined ?
							(datasetRolesList.group_roles.map((group_role) => (
								//<GroupAndRoleTableEntry
								//	group_role={group_role}
								//	/>
							<TableRow
								key={group_role.group.id}
								sx={{'&:last-child td, &:last-child th': {border: 0}}}
							>
								<TableCell>{group_role.group.name}</TableCell>
								<TableCell
									align="right">{group_role.role}</TableCell>
								<TableCell align="right"></TableCell>
							</TableRow>))) : <></>
					}
				</TableBody>
			</Table>
		</TableContainer>
	)

}
