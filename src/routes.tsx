import React from "react";
import {Route, Redirect, Switch, BrowserRouter} from "react-router-dom";

import {Dashboard} from "./components/Dashbard";
import {Dataset as DatasetComponent} from "./components/Dataset";
import {File as FileComponent} from "./components/File";
import {Login as LoginComponent} from "./components/Login";
import {Register as RegisterComponent} from "./components/Register";

import {isAuthorized} from "./utils/common";

// @ts-ignore
export const PrivateRoute = ({ component: Component, ...rest }) => (
	<Route {...rest} render={props => (
		isAuthorized()
			? <Component {...props} />
			: <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
	)} />
);

const Routes = (
	<BrowserRouter>
		<Switch>
			<PrivateRoute exact path="/" component={Dashboard} />
			<PrivateRoute path="/datasets/:datasetId" component={DatasetComponent} />
			<PrivateRoute path="/files/:fileId" component={FileComponent} />
			<Route exact path="/login" component={LoginComponent} />
			<Route exact path="/register" component={RegisterComponent} />
		</Switch>
	</BrowserRouter>

);





export default Routes;
