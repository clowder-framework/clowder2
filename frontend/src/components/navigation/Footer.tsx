import React from "react";
import {
	AppBar,
	Box,
	Container,
	Link,
	Toolbar,
	Typography,
} from "@mui/material";
import config from "../../app.config";
import { theme } from "../../theme";

export const Footer = () => {
	const appVersion = config.appVersion;

	return (
		<AppBar position="static" color="inherit" component="footer">
			<Container sx={{ maxWidth: "inherit!important" }}>
				<Toolbar sx={{ justifyContent: "space-between", alignItems: "center" }}>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<img
							src="../../public/grey-clowder-logo-icon.svg"
							alt="Clowder Logo"
							style={{
								marginRight: 8,
								height: "20px",
								color: theme.palette.info.main,
							}}
						/>
						<Typography variant="body1" sx={{ color: theme.palette.info.main }}>
							Powered by Clowder | {appVersion}
						</Typography>
					</Box>
					<Box sx={{ display: "flex" }}>
						<Link
							href={config.slackChannel}
							color="primary"
							sx={{ ml: 2, textDecoration: "none" }}
							target="_blank"
						>
							Slack
						</Link>
						<Link
							href={config.documentation}
							color="primary"
							sx={{ ml: 2, textDecoration: "none" }}
							target="_blank"
						>
							Documentation
						</Link>
						<Link
							href={`mailto:${config.mailingList}`}
							color="primary"
							sx={{ ml: 2, textDecoration: "none" }}
							target="_blank"
						>
							Contact Us
						</Link>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
};
