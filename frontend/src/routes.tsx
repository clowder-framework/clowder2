import React from "react";
import {Route, Navigate, Routes, BrowserRouter} from "react-router-dom";

import {Dashboard} from "./components/Dashbard";
import {Dataset as DatasetComponent} from "./components/datasets/Dataset";
import {File as FileComponent} from "./components/files/File";
import {CreateDataset} from "./components/datasets/CreateDataset";

import {RedirectRegister as RedirectRegisterComponent} from "./components/auth/RedirectRegister";
import {Auth as AuthComponent} from "./components/auth/Auth";
import {RedirectLogin as RedirectLoginComponent} from "./components/auth/RedirectLogin";
import {RedirectLogout as RedirectLogoutComponent} from "./components/auth/RedirectLogout";

import {isAuthorized} from "./utils/common";
// import {DisplayMetadata} from "./components/metadata/DisplayMetadata";

// https://dev.to/iamandrewluca/private-route-in-react-router-v6-lg5
class PrivateRoute extends React.Component<{ children: JSX.Element }> {
	render() {
		let {children} = this.props;
		return isAuthorized() ? children : <Navigate to="/auth/login"/>;
	}
}


const AppRoutes = (
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
			<Route path="/create-dataset/" element={<PrivateRoute><CreateDataset/></PrivateRoute>} />
			<Route path="/datasets/:datasetId" element={<PrivateRoute><DatasetComponent/></PrivateRoute>} />
			{/*<Route path="/datasets/:datasetId/metadata" element={<PrivateRoute><DisplayMetadata/></PrivateRoute>} />*/}
			<Route path="/files/:fileId" element={<PrivateRoute><FileComponent/></PrivateRoute>} />
			{/*<Route path="/files/:fileId/metadata" element={<PrivateRoute><DisplayMetadata/></PrivateRoute>} />*/}
			<Route path="/auth/register" element={<RedirectRegisterComponent/>} />
			<Route path="/auth/login" element={<RedirectLoginComponent/>} />
			<Route path="/auth/logout" element={<RedirectLogoutComponent/>} />
			<Route path="/auth" element={<AuthComponent/>} />
			<Route path="*"
				element={
					<main style={{ padding: "1rem" }}>
						<p>Page Not Found!</p>
					</main>
				}
			/>
		</Routes>
	</BrowserRouter>
);
export default AppRoutes;

