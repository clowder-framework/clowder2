import React, { useState } from "react";
import { Button, Card, CardActions, CardContent, Grid } from "@mui/material";
import Collapse from "@mui/material/Collapse";
import { VisualizationDataDetail } from "./VisualizationDataDetail";
import { VisualizationDataOut } from "../../openapi/v2";
import { VisComponentDefinitions } from "../../visualization.config";
import { PresignedUrlShareModal } from "../sharing/PresignedUrlShareModal";
import { useDispatch, useSelector } from "react-redux";
import {
	generateVisPresignedUrl as generateVisPresignedUrlAction,
	RESET_VIS_DATA_PRESIGNED_URL,
} from "../../actions/visualization";
import { RootState } from "../../types/data";
import {RESET_PUBLIC_VIS_DATA_PRESIGNED_URL} from "../../actions/public_visualization";

type previewProps = {
	publicVisComponentDefinition: VisComponentDefinitions;
	publicVisualizationDataItem: VisualizationDataOut;
};

export const PublicVisualizationCard = (props: previewProps) => {
	const { publicVisComponentDefinition, publicVisualizationDataItem } = props;
	const [expanded, setExpanded] = React.useState(false);
	const [visShareModalOpen, setVisShareModalOpen] = useState(false);

	// share visualization
	const dispatch = useDispatch();
	const generateVisPresignedUrl = (
		visualizationId: string | undefined,
		expiresInSeconds: number | undefined
	) =>
		dispatch(generateVisPresignedUrlAction(visualizationId, expiresInSeconds));
	const presignedUrl = useSelector(
		(state: RootState) => state.publicVisualization.publicPresignedUrl
	);

	const handleExpandClick = () => {
		setExpanded(!expanded);
	};

	const handleShareLinkClick = () => {
		generateVisPresignedUrl(publicVisualizationDataItem.id, 7 * 24 * 3600);
		setVisShareModalOpen(true);
	};
	const setVisShareModalClose = () => {
		setVisShareModalOpen(false);
		dispatch({ type: RESET_PUBLIC_VIS_DATA_PRESIGNED_URL });
	};

	return (
		<Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
			<Card>
				<PresignedUrlShareModal
					presignedUrl={presignedUrl}
					presignedUrlShareModalOpen={visShareModalOpen}
					setPresignedUrlShareModalOpen={setVisShareModalOpen}
					setPresignedUrlShareModalClose={setVisShareModalClose}
				/>
				<Collapse in={!expanded} timeout="auto" unmountOnExit>
					<CardContent>
						{React.cloneElement(publicVisComponentDefinition.component, {
							visualizationId: publicVisualizationDataItem.id,
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
					<Button onClick={handleShareLinkClick} sx={{ marginLeft: "auto" }}>
						Share Link
					</Button>
				</CardActions>
				<Collapse in={expanded} timeout="auto" unmountOnExit>
					<CardContent>
						<VisualizationDataDetail
							visualizationDataItem={publicVisualizationDataItem}
						/>
					</CardContent>
				</Collapse>
			</Card>
		</Grid>
	);
};
