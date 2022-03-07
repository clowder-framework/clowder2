import React, {useEffect} from "react";
import {Link} from "react-router-dom";

export const RedirectLogin = (): JSX.Element => {
	const url = "http://localhost:8000/api/v2/keycloak/login";
	useEffect(() => {
		window.location.href = url;
	}, []);

	return (
		<Link to={{ pathname: url }} target="_blank" />
	)
}
