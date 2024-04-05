import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { authCheck } from "../../utils/common";

export const AuthWrapper = (props): JSX.Element => {
	const { currRole, allowedRoles, children } = props;
	const adminMode = useSelector((state: RootState) => state.user.adminMode);

	return <>{authCheck(adminMode, currRole, allowedRoles) ? children : <></>}</>;
};
