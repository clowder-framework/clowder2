import React, {useEffect} from "react";
import {useDispatch} from "react-redux";
import {SET_USER} from "../../actions/user";
import {Navigate} from "react-router-dom";
import {V2} from "../../openapi";
import Cookies from "universal-cookie";

export const Auth = (): JSX.Element => {
	const dispatch = useDispatch();
	const cookies = new Cookies();
	// component did mount
	useEffect(() => {
		const token = cookies.get("Authorization").replace("Bearer ", "");
		if (token !== undefined && token !== "none") {
			localStorage.setItem("Authorization", `bearer ${token}`);
			V2.OpenAPI.TOKEN =token;
			return dispatch({
				type: SET_USER,
				Authorization: `bearer ${token}`,
			});
		}
	}, []);

	return (
		<Navigate to={"/"}/>
	)
}
