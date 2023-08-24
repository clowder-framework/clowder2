import React from "react";
import { Button, Card, CardActions, CardContent, Grid } from "@mui/material";
import Collapse from "@mui/material/Collapse";
import { VisualizationDataDetail } from "./VisualizationDataDetail";
import { VisualizationDataOut } from "../../openapi/v2";
import { VisComponentDefinitions } from "../../visualization.config";

type previewProps = {
	visComponentDefinition: VisComponentDefinitions;
	visualizationDataItem: VisualizationDataOut;
};

export const VisualizationCard = (props: previewProps) => {
	const { visComponentDefinition, visualizationDataItem } = props;
	const [expanded, setExpanded] = React.useState(false);
	const handleExpandClick = () => {
		setExpanded(!expanded);
	};
	return (
		<Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
			<Card>
				<Collapse in={!expanded} timeout="auto" unmountOnExit>
					<CardContent>
						{React.cloneElement(visComponentDefinition.component, {
							visualizationId: visualizationDataItem.id,
						})}
					</CardContent>
				</Collapse>
				<CardActions sx={{ padding: "0 auto" }}>
					{!expanded ? (
						<Button onClick={handleExpandClick} sx={{ marginLeft: "auto" }}>
							Learn More
						</Button>
					) : (
						<Button onClick={handleExpandClick} sx={{ marginLeft: "auto" }}>
							View
						</Button>
					)}
				</CardActions>
				<Collapse in={expanded} timeout="auto" unmountOnExit>
					<CardContent>
						<VisualizationDataDetail
							visualizationDataItem={visualizationDataItem}
						/>
					</CardContent>
				</Collapse>
			</Card>
		</Grid>
	);
};
