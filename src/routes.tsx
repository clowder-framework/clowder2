import React from "react";
import {Route, Switch} from "react-router-dom";

// import App from "./containers/App";
import {App} from "./components/App";

const Routes = (
	<Switch>
		<Route exact path="/" render={() => {return (<App: JSX.Element/>);}}/>
	</Switch>);

export default Routes;
