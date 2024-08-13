import React from "react";
import { Grid, Link, Typography } from "@mui/material";
import Layout from "../Layout";

export const Forbidden = (): JSX.Element => {
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
						Access Denied
					</Typography>
					<Typography variant="body1" paragraph>
						You do not have permission to access this resource.
					</Typography>
					<Typography variant="body1" paragraph>
						Go back{" "}
						<Link href="/" variant="body1">
							home
						</Link>
					</Typography>
				</Grid>
			</Grid>
		</Layout>
	);
};
