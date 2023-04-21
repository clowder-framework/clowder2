import React, {useEffect, useState} from "react";
import {RootState} from "../../types/data";
import {fetchDatasetGroupsAndRoles, fetchDatasetUsersAndRoles} from "../../actions/dataset";
import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import ChangeDatasetRoleModal from "../datasets/ChangeDatasetRoleModal";


export const UserAndRoleTable = (): JSX.Element => {

	const {datasetId} = useParams<{ datasetId?: string }>();

	const dispatch = useDispatch();

	const getUsersAndRoles = (datasetId: string | undefined) => dispatch(fetchDatasetUsersAndRoles(datasetId));
	const datasetUsersAndRolesList = useSelector((state: RootState) => state.dataset.usersAndRoles);
	const [sharePaneOpen, setSharePaneOpen] = useState(false);

	const handleShareClose = () => {
        setSharePaneOpen(false);
    }



	useEffect(() => {
		getUsersAndRoles(datasetId);
		console.log('users and roles', datasetUsersAndRolesList);

	}, []);


	function clickButton(currentUserId, currentUserRole) {
		// reset error message and close the error window
		console.log(currentUserId, currentUserRole);
		console.log('change role now for user');
		setSharePaneOpen(true);
	}

	return (
		<>
			<div>
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
							datasetUsersAndRolesList.map((user_role) => (
								<TableRow
									key={user_role.user_id}
									sx={{'&:last-child td, &:last-child th': {border: 0}}}
								>
									<TableCell
										align="right">{user_role.user_id}</TableCell>
									<TableCell
										align="right">{user_role.roleType}</TableCell>
									<TableCell
										align="right">{user_role.roleType}</TableCell>
									<TableCell
										align="right"><button value={user_role.user_id} onClick={() => clickButton(user_role.user_id, user_role.roleType)}>click to change role</button>
										<ChangeDatasetRoleModal open={sharePaneOpen} handleClose={handleShareClose} datasetName={"datasetName"} currentRole={user_role.roleType} currentUser={user_role.user_id}/>
									</TableCell>
								</TableRow>
							))
						}
					</TableBody>
				</Table>
			</TableContainer>
			</div>
		</>
	)

}
