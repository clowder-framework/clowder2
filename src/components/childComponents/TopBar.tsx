import React from "react";
import {
	AppBar,
	Link,
	Toolbar
} from "@mui/material";
import Box from "@mui/material/Box";

const link = {
	textDecoration: "none",
	fontSize: "16px",
	color: "#495057",
	m: 2,
};

export default function TopBar() {
	return (
		<Box sx={{
			flexGrow: 1,
		}}>
			<AppBar position="static" sx={{
				background: "#FFFFFF",
				boxShadow: "none",
			}}>
				<Toolbar sx={{
					padding: "0 45px"
				}}>
					<img src="../../public/clowder-logo-sm.svg" alt="clowder-logo-sm"/>
					<Link href="/" sx={link}>Home</Link>
					<Link href="https://clowderframework.org/" target="_blank" sx={link}>
						Help</Link>

					<Link href="/" sx={link}>Explore</Link>
					<Link href="/logout" sx={link}>Logout</Link>
				</Toolbar>
			</AppBar>
		</Box>
	);
}
