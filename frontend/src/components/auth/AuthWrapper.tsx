import React from "react";

export const AuthWrapper = (props): JSX.Element => {
	const { currRole, allowedRoles, children } = props;
	return <>{allowedRoles.includes(currRole) ? children : <></>}</>;
};
