import React, { useEffect, useState } from "react";
import { Button, Card, CardActions, CardContent, Grid } from "@mui/material";
import Collapse from "@mui/material/Collapse";
import { VisualizationDataDetail } from "./VisualizationDataDetail";
import { VisualizationDataOut } from "../../openapi/v2";
import { VisComponentDefinitions } from "../../visualization.config";
import { VisualizationShareModal } from "./VisualizationShareModal";
import { useDispatch, useSelector } from "react-redux";
import { generateVisPresignedUrl as generateVisPresignedUrlAction } from "../../actions/visualization";
import { RootState } from "../../types/data";

type previewProps = {
	visComponentDefinition: VisComponentDefinitions;
	visualizationDataItem: VisualizationDataOut;
};

export const VisualizationCard = (props: previewProps) => {
	const { visComponentDefinition, visualizationDataItem } = props;
	const [expanded, setExpanded] = React.useState(false);
	const [visShareModalOpen, setVisShareModalOpen] = useState(false);

	// share visualization
	const dispatch = useDispatch();
	const generateVisPresignedUrl = (visualizationId: string | undefined) =>
		dispatch(generateVisPresignedUrlAction(visualizationId));
	const presignedUrl = useSelector(
		(state: RootState) => state.visualization.presigned_url
	);
	useEffect(() => {
		if (visShareModalOpen) {
			generateVisPresignedUrl(visualizationDataItem.id);
		}
	}, [visShareModalOpen]);

	const handleExpandClick = () => {
		setExpanded(!expanded);
	};

	return (
		<Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
			<Card>
				{visShareModalOpen ? (
					<VisualizationShareModal
						presignedUrl={presignedUrl}
						visShareModalOpen={visShareModalOpen}
						setVisShareModalOpen={setVisShareModalOpen}
					/>
				) : (
					<></>
				)}
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
					<Button
						onClick={() => setVisShareModalOpen(true)}
						sx={{ marginLeft: "auto" }}
					>
						Share
					</Button>
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
