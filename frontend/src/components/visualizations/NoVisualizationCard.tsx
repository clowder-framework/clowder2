import React from "react";
import { Card, CardContent, Grid } from "@mui/material";

type previewProps = {
	msg?: string;
};

export const NoVisualizationCard = (props: previewProps) => {
	const { msg } = props;

	return (
		<Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
			<Card>
				<CardContent>
					{msg}
				</CardContent>
			</Card>
		</Grid>
	);
};
