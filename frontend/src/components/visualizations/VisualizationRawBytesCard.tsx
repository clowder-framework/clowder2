import React from "react";
import {
	Card,
	CardActions,
	CardContent,
	Grid,
	IconButton,
} from "@mui/material";
import { VisComponentDefinitions } from "../../visualization.config";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

type previewProps = {
	fileId?: string;
	visComponentDefinition: VisComponentDefinitions;
};

export const VisualizationRawBytesCard = (props: previewProps) => {
	const { visComponentDefinition, fileId } = props;
	const [fullscreen, setFullscreen] = React.useState(false); // Default to normal view
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
				<CardContent>
					{React.cloneElement(visComponentDefinition.component, {
						fileId: fileId,
					})}
				</CardContent>
				<CardActions sx={{ float: "right" }}>
					<IconButton onClick={handleFullscreenToggle}>
						{fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
					</IconButton>
				</CardActions>
			</Card>
		</Grid>
	);
};
