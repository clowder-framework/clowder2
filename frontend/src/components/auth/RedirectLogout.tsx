import React, { useEffect } from "react";
import { logout } from "../../actions/user";
import TopBar from "../navigation/TopBar";
import { useDispatch } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "@mui/material";

export const RedirectLogout = (): JSX.Element => {
	const dispatch = useDispatch();
	const logUserOut = () => dispatch(logout());

	useEffect(() => {
		logUserOut();
	}, []);

	return (
		<div>
			<TopBar />
			<div className="outer-container">
				<p>
					You have logged out.{" "}
					<Link component={RouterLink} to="/auth/login">
						Log in again.
					</Link>
				</p>
			</div>
		</div>
	);
};
