import React from "react";
import { Card, CardContent } from "@mui/material";
import { VisComponentDefinitions } from "../../visualization.config";

type previewProps = {
	fileId?: string;
	visComponentDefinition: VisComponentDefinitions;
};

export const VisualizationRawBytesCard = (props: previewProps) => {
	const { visComponentDefinition, fileId } = props;

	return (
		<Card>
			<CardContent>
				{React.cloneElement(visComponentDefinition.component, {
					fileId: fileId,
				})}
			</CardContent>
		</Card>
	);
};
