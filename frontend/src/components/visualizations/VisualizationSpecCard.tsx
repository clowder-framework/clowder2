import React from "react";
import { Button, Card, CardActions, CardContent, Grid } from "@mui/material";
import Collapse from "@mui/material/Collapse";
import { VisualizationConfigOut } from "../../openapi/v2";
import { VisComponentDefinitions } from "../../visualization.config";

type previewProps = {
	visComponentDefinition: VisComponentDefinitions;
	visConfigEntry: VisualizationConfigOut;
};

export const VisualizationSpecCard = (props: previewProps) => {
	const { visComponentDefinition, visConfigEntry } = props;
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
							visConfigEntry: visConfigEntry,
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
						<VisualizationConfigDetail visConfigEntry={visConfigEntry} />
					</CardContent>
				</Collapse>
			</Card>
		</Grid>
	);
};
