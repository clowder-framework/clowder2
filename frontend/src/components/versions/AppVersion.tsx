import React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import { theme } from "../../theme";
import config from "../../app.config";

export function AppVersion() {
	return (
		<Box
			sx={{
				position: "fixed",
				bottom: 0,
				right: 0,
				width: "100%",
				textAlign: "right", // Centers the icon button
			}}
		>
			<Tooltip title={config.appVersion} placement="top" arrow>
				<IconButton>
					<InfoIcon sx={{ color: theme.palette.primary.main }} />
				</IconButton>
			</Tooltip>
		</Box>
	);
}
