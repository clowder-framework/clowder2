import React, { useEffect, useState } from "react";
import {
	Button,
	Card,
	CardActions,
	CardContent,
	Grid,
	IconButton,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import { VisualizationDataDetail } from "./VisualizationDataDetail";
import { VisualizationDataOut } from "../../openapi/v2";
import { VisComponentDefinitions } from "../../visualization.config";
import { PresignedUrlShareModal } from "../sharing/PresignedUrlShareModal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import {
	generatePublicVisPresignedUrl as generatePublicVisPresignedUrlAction,
	RESET_PUBLIC_VIS_DATA_PRESIGNED_URL,
} from "../../actions/public_visualization";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

type publicPreviewProps = {
	publicVisComponentDefinition: VisComponentDefinitions;
	publicVisualizationDataItem: VisualizationDataOut;
};

export const PublicVisualizationCard = (props: publicPreviewProps) => {
	const { publicVisComponentDefinition, publicVisualizationDataItem } = props;
	const [expandInfo, setExpandInfo] = React.useState(false);
	const [fullscreen, setFullscreen] = React.useState(false); // Default to normal view
	const [visShareModalOpen, setVisShareModalOpen] = useState(false);
	// share visualization
	const dispatch = useDispatch();
	const generatePublicVisPresignedUrl = (
		visualizationId: string | undefined,
		expiresInSeconds: number | undefined
	) =>
		dispatch(
			generatePublicVisPresignedUrlAction(visualizationId, expiresInSeconds)
		);
	const presignedUrl = useSelector(
		(state: RootState) => state.publicVisualization.publicPresignedUrl
	);

	useEffect(() => {
		if (expandInfo) setFullscreen(false);
	}, [expandInfo]);

	const handleExpandClick = () => {
		setExpandInfo(!expandInfo);
	};

	const handleShareLinkClick = () => {
		generatePublicVisPresignedUrl(
			publicVisualizationDataItem.id,
			7 * 24 * 3600
		);
		setVisShareModalOpen(true);
	};
	const setVisShareModalClose = () => {
		setVisShareModalOpen(false);
		dispatch({ type: RESET_PUBLIC_VIS_DATA_PRESIGNED_URL });
	};

	const handleFullscreenToggle = () => {
		setFullscreen(!fullscreen);
	};

	return (
		<Grid
			item
			xs={12}
			sm={fullscreen ? 12 : 4}
			md={fullscreen ? 12 : 4}
			lg={fullscreen ? 12 : 4}
			xl={fullscreen ? 12 : 4}
		>
			<Card sx={{ height: "100%" }}>
				<PresignedUrlShareModal
					presignedUrl={presignedUrl}
					presignedUrlShareModalOpen={visShareModalOpen}
					setPresignedUrlShareModalOpen={setVisShareModalOpen}
					setPresignedUrlShareModalClose={setVisShareModalClose}
				/>
				<Collapse in={!expandInfo} timeout="auto" unmountOnExit>
					<CardContent>
						{React.cloneElement(publicVisComponentDefinition.component, {
							publicView: true,
							visualizationId: publicVisualizationDataItem.id,
						})}
					</CardContent>
				</Collapse>
				<CardActions sx={{ display: "flex", justifyContent: "space-between" }}>
					<div>
						<Button onClick={handleExpandClick}>
							{expandInfo ? "View" : "Learn More"}
						</Button>
						<Button onClick={handleShareLinkClick}>Share Link</Button>
					</div>
					<IconButton onClick={handleFullscreenToggle}>
						{fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
					</IconButton>
				</CardActions>
				<Collapse in={expandInfo} timeout="auto" unmountOnExit>
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
