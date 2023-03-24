import React, {useEffect, useState} from "react";
import {RootState} from "../../types/data";
import {fetchDatasetGroupsAndRoles, fetchDatasetUsersAndRoles} from "../../actions/dataset";
import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";


export const GroupAndRoleTable = (): JSX.Element => {

	const {datasetId} = useParams<{ datasetId?: string }>();

	const dispatch = useDispatch();

	const getGroupsAndRoles = (datasetId: string | undefined) => dispatch(fetchDatasetGroupsAndRoles(datasetId));
	const datasetGroupsAndRolesList = useSelector((state: RootState) => state.dataset.groupsAndRoles);
	const [sharePaneOpen, setSharePaneOpen] = useState(false);

	const handleShareClose = () => {
        setSharePaneOpen(false);
    }

	useEffect(() => {
		getGroupsAndRoles(datasetId);
		console.log('groups and roles', datasetGroupsAndRolesList);
	}, []);


	const clickButton = () => {
		// reset error message and close the error window
		console.log('change role now');
	}

	return (
		<TableContainer>
			<Table sx={{minWidth: 650}} aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell align="right">ID</TableCell>
						<TableCell align="right">Name</TableCell>
						<TableCell align="right">Role</TableCell>
						<TableCell align="right">Change Role</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>

					{
						datasetGroupsAndRolesList.map((group_role) => (
							<TableRow
								key={group_role.group_id}
								sx={{'&:last-child td, &:last-child th': {border: 0}}}
							>
								<TableCell
									align="right">{group_role.group_id}</TableCell>
								<TableCell
									align="right">{group_role.group_name}</TableCell>
								<TableCell
									align="right">{group_role.roleType}</TableCell>
								<TableCell
									align="right"><button value={group_role.group_id} onClick={clickButton}>click to change role</button></TableCell>
							</TableRow>))
					}
				</TableBody>
			</Table>
		</TableContainer>
	)

}
