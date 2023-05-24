import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import config from "../../app.config";

export const RedirectLogin = (): JSX.Element => {
	const url = config.KeycloakLogin;

	useEffect(() => {
		window.location.href = url;
	}, []);

	return <Link to={{ pathname: url }} target="_blank" />;
};
