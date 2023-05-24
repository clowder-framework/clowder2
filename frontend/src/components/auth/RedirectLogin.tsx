import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import config from "../../app.config";

export const RedirectLogin = (): JSX.Element => {
	const url = config.KeycloakLogin;

	// search parameters redirect to origin
	const [searchParams] = useSearchParams();
	const origin = searchParams.get("origin");

	useEffect(() => {
		window.location.href = url;
	}, []);

	return <Link to={{ pathname: url }} target="_blank" />;
};
