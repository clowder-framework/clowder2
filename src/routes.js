import React from "react";
import {Route, Switch} from "react-router-dom";

import File from "./containers/File";
import Dataset from "./containers/Dataset";


export default (
	<Switch>
		<Route exact path="/dataset" render={() => {
			return (<Dataset/>);
		}}/>
		<Route exact path="/file" render={(props) => {return (<File {...props}/>);}}/>
	</Switch>
);
