import React from "react";
import {Route, Navigate, Routes, BrowserRouter} from "react-router-dom";

import {Dashboard} from "./components/Dashbard";
import {Dataset as DatasetComponent} from "./components/Dataset";
import {File as FileComponent} from "./components/File";
import {Login as LoginComponent} from "./components/Login";
import {Logout as LogoutComponent} from "./components/Logout";
import {Register as RegisterComponent} from "./components/Register";

import {isAuthorized} from "./utils/common";

// https://dev.to/iamandrewluca/private-route-in-react-router-v6-lg5
class PrivateRoute extends React.Component<{ children: JSX.Element }> {
	render() {
		let {children} = this.props;
		return isAuthorized() ? children : <Navigate to="/login"/>;
	}
}


const AppRoutes = (
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
			<Route path="/datasets/:datasetId" element={<PrivateRoute><DatasetComponent/></PrivateRoute>} />
			<Route path="/files/:fileId" element={<PrivateRoute><FileComponent/></PrivateRoute>} />
			<Route path="/login" element={<LoginComponent/>} />
			<Route path="/logout" element={<LogoutComponent/>} />
			<Route path="/register" element={<RegisterComponent/>} />
		</Routes>
	</BrowserRouter>
);
export default AppRoutes;

