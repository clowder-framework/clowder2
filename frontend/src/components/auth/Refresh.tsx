import React, {useEffect} from "react";
import {useDispatch} from "react-redux";
import {refresh as refreshAction} from "../../actions/user";

export const Refresh = (): JSX.Element => {

	const dispatch = useDispatch();
	const refresh = () => dispatch(refreshAction());

	useEffect(() => {
		refresh();
	}, []);

	return (
		<div>Refresh Token</div>
	)
}
