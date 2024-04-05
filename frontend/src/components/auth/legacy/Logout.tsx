import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "../../../actions/user";
import { Navigate } from "react-router-dom";

export const Logout = (): JSX.Element => {
	const dispatch = useDispatch();
	const logout = () => dispatch(logoutAction());
	// component did mount
	useEffect(() => {
		logout();
	}, []);

	return <Navigate to={"/auth/login"} />;
};
