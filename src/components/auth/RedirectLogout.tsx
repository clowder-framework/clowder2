import React, {useEffect} from "react";
import {logoutHelper} from "../../actions/user";

export const RedirectLogout = (): JSX.Element => {
	useEffect(() => {
		logoutHelper();
	}, []);

	return (
		<div>Logged Out!</div>
	)
}
