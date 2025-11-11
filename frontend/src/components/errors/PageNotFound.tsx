import React from "react";
import { Grid, Link, Typography } from "@mui/material";
import Layout from "../Layout";
import { Link as RouterLink } from "react-router-dom";

export const PageNotFound = (): JSX.Element => {
	return (
		<Layout>
			<Grid
				container
				spacing={0}
				direction="column"
				alignItems="center"
				justifyContent="center"
				style={{ minHeight: "40vh" }}
			>
				<Grid item xs={4}>
					<Typography variant="h4" paragraph>
						Page Not Found
					</Typography>
					<Typography variant="body1" paragraph>
						The page you are looking for does not exist.
					</Typography>
					<Typography variant="body1" paragraph>
						Go back{" "}
						<Link component={RouterLink} to="/" variant="body1">
							home
						</Link>
					</Typography>
				</Grid>
			</Grid>
		</Layout>
	);
};
