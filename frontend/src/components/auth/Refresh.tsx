import React, {useEffect} from "react";
import {refreshHelper} from "../../actions/user";

export const Refresh = (): JSX.Element => {
	useEffect(() => {
		refreshHelper();
	}, []);

	return (
		<div>Refresh Token</div>
	)
}
