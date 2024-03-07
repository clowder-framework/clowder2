import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../types/data";

export const AuthWrapper = (props): JSX.Element => {
	const { currRole, allowedRoles, children } = props;
	const adminMode = useSelector((state: RootState) => state.user.adminMode);

	return <>{adminMode || allowedRoles.includes(currRole) ? children : <></>}</>;
};
