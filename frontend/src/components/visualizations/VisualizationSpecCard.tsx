import React, { useEffect } from "react";
import {
	Button,
	Card,
	CardActions,
	CardContent,
	Grid,
	IconButton,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import { VisualizationConfigOut } from "../../openapi/v2";
import { VisComponentDefinitions } from "../../visualization.config";
import { VisualizationParamDetail } from "./VisualizationParamDetail";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

type previewProps = {
	visComponentDefinition: VisComponentDefinitions;
	visConfigEntry: VisualizationConfigOut;
};

export const VisualizationSpecCard = (props: previewProps) => {
	const { visComponentDefinition, visConfigEntry } = props;
	const [expandInfo, setExpandInfo] = React.useState(false);
	const [fullscreen, setFullscreen] = React.useState(false); // Default to normal view

	useEffect(() => {
		if (expandInfo) setFullscreen(false);
	}, [expandInfo]);

	const handleExpandClick = () => {
		setExpandInfo(!expandInfo);
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
				<Collapse in={!expandInfo} timeout="auto" unmountOnExit>
					<CardContent>
						{React.cloneElement(visComponentDefinition.component, {
							visConfigEntry: visConfigEntry,
						})}
					</CardContent>
				</Collapse>
				<CardActions sx={{ display: "flex", justifyContent: "space-between" }}>
					{!expandInfo ? (
						<Button onClick={handleExpandClick} sx={{ marginLeft: "auto" }}>
							Learn More
						</Button>
					) : (
						<Button onClick={handleExpandClick} sx={{ marginLeft: "auto" }}>
							View
						</Button>
					)}
					<IconButton onClick={handleFullscreenToggle}>
						{fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
					</IconButton>
				</CardActions>
				<Collapse in={expandInfo} timeout="auto" unmountOnExit>
					<CardContent>
						<VisualizationParamDetail visConfigEntry={visConfigEntry} />
					</CardContent>
				</Collapse>
			</Card>
		</Grid>
	);
};
