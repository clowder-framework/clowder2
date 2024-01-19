import React from "react";
import { Card, CardContent, Grid } from "@mui/material";
import { VisComponentDefinitions } from "../../visualization.config";

type previewProps = {
	fileId?: string;
	visComponentDefinition: VisComponentDefinitions;
};

export const VisualizationRawBytesCard = (props: previewProps) => {
	const { visComponentDefinition, fileId } = props;

	return (
		<Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
			<Card>
				<CardContent>
					{React.cloneElement(visComponentDefinition.component, {
						fileId: fileId,
					})}
				</CardContent>
			</Card>
		</Grid>
	);
};
