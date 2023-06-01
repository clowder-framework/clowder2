import React from "react";
import { ErrorBoundary } from "@appbaseio/reactivesearch";
import { V2 } from "../../openapi";
import { Navigate, useLocation } from "react-router-dom";
import { Typography } from "@mui/material";

import Cookies from "universal-cookie";
import { theme } from "../../theme";

const cookies = new Cookies();

export function SearchErrorBoundary(props) {
	const { children } = props;

	// get current location
	const location = useLocation();
	const origin = `${location.pathname}${location.search}`;

	return (
		<ErrorBoundary
			renderError={(error) => (
				<>
					{(() => {
						if (error["status"] === 401 || error["status"] === 403) {
							V2.OpenAPI.TOKEN = undefined;
							cookies.remove("Authorization", { path: "/" });
							return <Navigate to={`/auth/login?origin=${origin}`} />;
						} else {
							return (
								<>
									<Typography
										variant="body1"
										sx={{ color: theme.palette.primary.main }}
									>
										{error["responses"][0].error.root_cause[0].reason}
									</Typography>
									<Typography variant="body2">
										Incorrect query syntax. For more information on query syntax
										please see
										<a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html">
											docs
										</a>
										.
									</Typography>
								</>
							);
						}
					})()}
				</>
			)}
		>
			{children}
		</ErrorBoundary>
	);
}
