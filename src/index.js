// Set up your application entry point here...
///* eslint-disable import/default */

import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import routes from "./routes";
import configureStore from "./store/configureStore";
import {createMuiTheme, MuiThemeProvider} from "@material-ui/core/styles";
import config from "./app.config";

require("./public/favicon.ico");

const store = configureStore();

const theme = createMuiTheme({

	typography: {
		fontFamily: "Rubik"
	},
	palette:{
		fontFamily: "Rubik"
	}

});

render(
	<MuiThemeProvider theme={theme}>
		<Provider store={store}>
			<BrowserRouter>
				{routes}
			</BrowserRouter>
		</Provider>

	</MuiThemeProvider>
	, document.getElementById("app")
);
