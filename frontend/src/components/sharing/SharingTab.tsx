import React, { useEffect, useState } from "react";
import { RootState } from "../../types/data";
import Card from "@mui/material/Card";
import { fetchDatasetRoles } from "../../actions/dataset";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { GroupAndRoleTable } from "./GroupAndRoleTable";
import { UserAndRoleTable } from "./UserAndRoleTable";
import { Box, CardContent } from "@mui/material";
import Typography from "@mui/material/Typography";

export const SharingTab = (): JSX.Element => {
	const { datasetId } = useParams<{ datasetId?: string }>();

	const dispatch = useDispatch();

	const getRoles = (datasetId: string | undefined) =>
		dispatch(fetchDatasetRoles(datasetId));
	const datasetRolesList = useSelector(
		(state: RootState) => state.dataset.roles
	);
	const [sharePaneOpen, setSharePaneOpen] = useState(false);

	const handleShareClose = () => {
		setSharePaneOpen(false);
	};

	useEffect(() => {
		getRoles(datasetId);
	}, []);

	const clickButton = () => {
		// reset error message and close the error window
		console.log("change role now");
	};

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
							{"Users"}
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

			<br />

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
							{"Groups"}
						</Typography>
					</Box>
				</Box>
			</Box>
			<Card
				key={"groupandrole"}
				sx={{ height: "100%", display: "flex", flexDirection: "column" }}
			>
				<CardContent>
					<GroupAndRoleTable />
				</CardContent>
			</Card>
		</>
	);
};
