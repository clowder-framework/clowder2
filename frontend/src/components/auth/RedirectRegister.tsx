import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import config from "../../app.config";

export const RedirectRegister = (): JSX.Element => {
	const url = config.KeycloakRegister;
	useEffect(() => {
		window.location.href = url;
	}, []);

	return <Link to={{ pathname: url }} target="_blank" />;
};
