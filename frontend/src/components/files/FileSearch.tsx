import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { ClowderInput } from "../styledComponents/ClowderInput";
import { ClowderButton } from "../styledComponents/ClowderButton";

export function FileSearch() {
	return (
		<Box className="infoCard">
			<Typography className="title">Tags</Typography>
			<Grid container spacing={4}>
				<Grid item lg={8} sm={8} xl={8} xs={12}>
					<ClowderInput defaultValue="Tag" />
				</Grid>
				<Grid item lg={4} sm={4} xl={4} xs={12}>
					<ClowderButton disabled={true}>Search</ClowderButton>
				</Grid>
			</Grid>
		</Box>
	);
}
