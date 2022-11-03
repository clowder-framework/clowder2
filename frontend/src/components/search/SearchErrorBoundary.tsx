import React from "react";
import {ErrorBoundary} from "@appbaseio/reactivesearch";
import {V2} from "../../openapi";
import {Navigate} from "react-router-dom";


import Cookies from "universal-cookie";
import {LuceneStringSearch} from "./LuceneStringSearch";

const cookies = new Cookies();

export function SearchErrorBoundary(props) {

	const {children} = props;

	return (
		<ErrorBoundary
			renderError={error => (
				<>
					{
						(() => {
							if (error["status"] === 401 || error["status"] === 403) {
								V2.OpenAPI.TOKEN = undefined;
								cookies.remove("Authorization", {path: "/"});
								return <Navigate to="/auth/login"/>;
							} else {
								// TODO add prettier message or report function
								return <h1>{error["status"]}</h1>
							}
						})()
					}
				</>
			)}
		>
			{children}
		</ErrorBoundary>
	)
}
