import React, {useEffect, useState} from "react";
import {RootState} from "../../types/data";
import Card from '@mui/material/Card';
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
import {GroupAndRoleTable} from "./GroupAndRoleTable";
import {UserAndRoleTable} from "./UserAndRoleTable";
import {Box, Button, CardContent} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import {AuthWrapper} from "../auth/AuthWrapper";
import Typography from "@mui/material/Typography";
import RoleChip from "../auth/RoleChip";


export const SharingTab = (): JSX.Element => {

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
	}, []);


	const clickButton = () => {
		// reset error message and close the error window
		console.log('change role now');
	}

	return (
		<>
			<Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
				<Box sx={{display: "flex", justifyContent: "flex-start", alignItems: "baseline"}}>
					<Box sx={{ display: "flex", flexDirection: "flex-start", alignItems: "baseline"}}>
						<Typography variant="h5" paragraph>
							{"Users"}
						</Typography>
					</Box>
				</Box>
				<Box sx={{display: "flex", justifyContent: "flex-start", alignItems: "baseline"}}>
					<Button variant="outlined"
							onClick={() => {
								console.log("add user");
							}} endIcon={<PersonAddAlt1Icon/>}>
						Add User
					</Button>
				</Box>
			</Box>
			<Card key={"userandrole"} sx={{height: "100%", display: "flex", flexDirection: "column"}}>
				<CardContent>
					<UserAndRoleTable></UserAndRoleTable>
				</CardContent>
			</Card>

			<br/>

			<Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
				<Box sx={{display: "flex", justifyContent: "flex-start", alignItems: "baseline"}}>
					<Box sx={{ display: "flex", flexDirection: "flex-start", alignItems: "baseline"}}>
						<Typography variant="h5" paragraph>
							{"Groups"}
						</Typography>
					</Box>
				</Box>
				<Box sx={{display: "flex", justifyContent: "flex-start", alignItems: "baseline"}}>
					<Button variant="outlined"
							onClick={() => {
								console.log("add group");
							}} endIcon={<PersonAddAlt1Icon/>}>
						Add Group
					</Button>
				</Box>
			</Box>
			<Card key={"groupandrole"} sx={{height: "100%", display: "flex", flexDirection: "column"}}>
				<CardContent>
					<GroupAndRoleTable></GroupAndRoleTable>
				</CardContent>
			</Card>

		</>
	)

}
