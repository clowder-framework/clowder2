import React from "react";

type AuthWrapperProps = {
	currRole: string;
	allowedRoles: string[];
	children: JSX.Element | JSX.Element[];
};

export const AuthWrapper = (props: AuthWrapperProps): JSX.Element => {
	const { currRole, allowedRoles, children } = props;
	return <>{allowedRoles.includes(currRole) ? children : <></>}</>;
};
