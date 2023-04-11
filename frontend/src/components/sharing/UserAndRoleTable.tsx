import React, {useEffect, useState} from "react";
import {RootState} from "../../types/data";
import {fetchDatasetRoles} from "../../actions/dataset";
import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";


export const UserAndRoleTable = (): JSX.Element => {

	const {datasetId} = useParams<{ datasetId?: string }>();

	const dispatch = useDispatch();

	const getRoles = (datasetId: string | undefined) => dispatch(fetchDatasetRoles(datasetId));
	const datasetRolesList = useSelector((state: RootState) => state.dataset.roles);
	const [sharePaneOpen, setSharePaneOpen] = useState(false);

	const handleShareClose = () => {
        setSharePaneOpen(false);
    }

	useEffect(() => {
		getRoles(datasetId);
		console.log('users and roles', datasetRolesList);

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
						datasetRolesList ? datasetRolesList.user_roles.map((user_role) => (
							<TableRow
								key={user_role.user.id}
								sx={{'&:last-child td, &:last-child th': {border: 0}}}
							>
								<TableCell
									align="right">{user_role.user.id}</TableCell>
								<TableCell
									align="right">{user_role.role}</TableCell>
								<TableCell
									align="right">{user_role.role}</TableCell>
								<TableCell
									align="right"><button value={user_role.user.id} onClick={clickButton}>click to change role</button></TableCell>

							</TableRow>)) : <></>
					}
				</TableBody>
			</Table>
		</TableContainer>
	)

}
