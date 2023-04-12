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
import Gravatar from "react-gravatar";
import PersonIcon from "@mui/icons-material/Person";
import {Button, ButtonGroup, FormControl, IconButton, InputLabel, MenuItem, Select} from "@mui/material";
import {AuthWrapper} from "../auth/AuthWrapper";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";


export const UserAndRoleTable = (): JSX.Element => {

	const {datasetId} = useParams<{ datasetId?: string }>();

	const dispatch = useDispatch();

	const datasetRole = useSelector((state: RootState) => state.dataset.datasetRole);
	const datasetRolesList = useSelector((state: RootState) => state.dataset.roles);
	const [sharePaneOpen, setSharePaneOpen] = useState(false);
	const [editRoleOn, setEditRoleOn] = useState(false);

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
					<TableRow >
						<TableCell>Name</TableCell>
						<TableCell align="right">Email</TableCell>
						<TableCell align="right">Role</TableCell>
						<TableCell align="right"></TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{
						datasetRolesList !== undefined && datasetRolesList.user_roles !== undefined ?
							(datasetRolesList.user_roles.map((user_role) => (
							<TableRow
								key={user_role.user.id}
								sx={{'&:last-child td, &:last-child th': {border: 0}}}
							>
								<TableCell component="th" scope="row" key={`${user_role.user.id}-icon`}>
									{
										user_role.user && user_role.user.email ?
											<Gravatar email={user_role.user.email} rating="g"
												  style={{width: "32px", height: "32px", borderRadius: "50%", verticalAlign: "middle"}}/>
											:
											<PersonIcon sx={iconStyle}/>
									}
									<Button >{user_role.user.first_name} {user_role.user.last_name}</Button>
								</TableCell>
								<TableCell align="right">{user_role.user.email}</TableCell>
								<TableCell align="right">
									{user_role.role}
								</TableCell>
								<TableCell align="right"></TableCell>
							</TableRow>))) : <></>
					}
				</TableBody>
			</Table>
		</TableContainer>
	)
}
