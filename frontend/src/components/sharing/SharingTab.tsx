import React, { useEffect } from "react";
import Card from "@mui/material/Card";
import { fetchDatasetRoles } from "../../actions/dataset";
import {useDispatch, useSelector} from "react-redux";
import { useParams } from "react-router-dom";
import { UserAndRoleTable } from "./UserAndRoleTable";
import { Box, CardContent } from "@mui/material";
import Typography from "@mui/material/Typography";
import {RootState} from "../../types/data";

export const SharingTab = (): JSX.Element => {
	const { datasetId } = useParams<{ datasetId?: string }>();

	const dispatch = useDispatch();
	const adminMode = useSelector((state: RootState) => state.user.adminMode)

	const getRoles = (datasetId: string | undefined) =>
		dispatch(fetchDatasetRoles(datasetId, adminMode));

	useEffect(() => {
		getRoles(datasetId);
	}, []);

	return (
		<>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "flex-start",
						alignItems: "baseline",
					}}
				>
					<Box
						sx={{
							display: "flex",
							flexDirection: "flex-start",
							alignItems: "baseline",
						}}
					>
						<Typography variant="h5" paragraph>
							{"Assigned Roles"}
						</Typography>
					</Box>
				</Box>
			</Box>
			<Card
				key={"userandrole"}
				sx={{ height: "100%", display: "flex", flexDirection: "column" }}
			>
				<CardContent>
					<UserAndRoleTable />
				</CardContent>
			</Card>
		</>
	);
};
