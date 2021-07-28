import React from "react";
import {Route, Switch} from "react-router-dom";

import File from "./containers/File";


export default (
	<Switch>
		<Route exact path="/" render={() => {
			return (<File/>);
		}}/>
	</Switch>
);
