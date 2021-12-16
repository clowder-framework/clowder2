import React, {useEffect} from "react";
import {Redirect} from "react-router-dom";
import {useDispatch} from "react-redux";
import {logout as logoutAction} from "../actions/user";

export const Logout = (): JSX.Element => {
	const dispatch = useDispatch();
	const logout = () => dispatch(logoutAction());

	// component did mount
	useEffect(() => { logout(); }, []);

	return (
		<Redirect to="/" />
	)
}
