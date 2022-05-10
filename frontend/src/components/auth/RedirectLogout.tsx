import React, {useEffect} from "react";
import {logout} from "../../actions/user";
import TopBar from "../navigation/TopBar";
import {useDispatch} from "react-redux";

export const RedirectLogout = (): JSX.Element => {

	const dispatch = useDispatch();
	const logUserOut = () => dispatch(logout());

	useEffect(() => {
		logUserOut();
	}, []);

	return (
		<div>
			<TopBar/>
			<div className="outer-container">
				<p>you have logged out.</p>
			</div>

		</div>

	)
}
