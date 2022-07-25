import React, {useEffect} from "react";
import {
	AppBar,
	Link,
	Toolbar
} from "@mui/material";
import Box from "@mui/material/Box";
import {useSelector} from "react-redux";
import {RootState} from "../../types/data";

const link = {
	textDecoration: "none",
	fontSize: "16px",
	color: "#495057",
	m: 2,
};

export default function TopBar() {

	const loggedOut = useSelector((state: RootState) => state.error.loggedOut);

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
					<Box display="flex" flexGrow={1}>
						<img src="../../public/clowder-logo-sm.svg" alt="clowder-logo-sm"/>
						<Link href="/" sx={link}>Explore</Link>
						<Link href="https://clowderframework.org/" target="_blank" sx={link}>
							Help</Link>
					</Box>
					{
						loggedOut ?
							<>
								<Link href="/auth/register" sx={link}>Register</Link>
								<Link href="/auth/login" sx={link}>Login</Link>
							</>
							:
							<Link href="/auth/logout" sx={link}>Logout</Link>
					}
				</Toolbar>
			</AppBar>
		</Box>
	);
}
