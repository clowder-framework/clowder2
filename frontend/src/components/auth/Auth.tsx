import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { SET_USER } from "../../actions/user";
import { Navigate } from "react-router-dom";
import { V2 } from "../../openapi";
import Cookies from "universal-cookie";

export const Auth = (): JSX.Element => {
	const dispatch = useDispatch();
	const cookies = new Cookies();

	// get latest origin from redux
	const origin = cookies.get("origin");

	useEffect(() => {
		const header = cookies.get("Authorization");
		if (header !== undefined && header !== "none") {
			const token = header.replace("Bearer ", "");
			V2.OpenAPI.TOKEN = token;
			return dispatch({
				type: SET_USER,
				Authorization: `Bearer ${token}`,
			});
		}
	}, []);

	return <Navigate to={origin ?? "/"} />;
};
