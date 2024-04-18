import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { authCheck } from "../../utils/common";

type AuthWrapperProps = {
	currRole: string;
	allowedRoles: string[];
	children: JSX.Element | JSX.Element[];
};

export const AuthWrapper = (props: AuthWrapperProps): JSX.Element => {
	const { currRole, allowedRoles, children } = props;
	const adminMode = useSelector((state: RootState) => state.user.adminMode);

	return <>{authCheck(adminMode, currRole, allowedRoles) ? children : <></>}</>;
};
