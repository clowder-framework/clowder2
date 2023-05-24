import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import config from "../../app.config";
import Cookies from "universal-cookie";

export const RedirectLogin = (): JSX.Element => {
	const url = config.KeycloakLogin;

	const [searchParams] = useSearchParams();
	const origin = searchParams.get("origin");
	const cookies = new Cookies();

	useEffect(() => {
		// restore the origin in cookies
		cookies.set("origin", origin);
		window.location.href = url;
	}, []);

	return <Link to={{ pathname: url }} target="_blank" />;
};
