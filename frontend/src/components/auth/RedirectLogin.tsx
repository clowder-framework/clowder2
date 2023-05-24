import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import config from "../../app.config";
import { useDispatch } from "react-redux";
import { setOrigin } from "../../actions/common";

export const RedirectLogin = (): JSX.Element => {
	const url = config.KeycloakLogin;

	const [searchParams] = useSearchParams();
	const origin = searchParams.get("origin");
	const dispatch = useDispatch();

	useEffect(() => {
		// record origin in redux
		dispatch(setOrigin(origin));

		window.location.href = url;
	}, []);

	return <Link to={{ pathname: url }} target="_blank" />;
};
