import React from "react";
import {Route, Switch} from "react-router-dom";

import App from "./containers/App";


export default (
	<Switch>
		<Route exact path="/" render={() => {return (<App/>);}}/>
	</Switch>
);
