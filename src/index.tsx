// Set up your application entry point here...
///* eslint-disable import/default */

import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import routes from "./routes";
import configureStore from "./store/configureStore";
import {createTheme, MuiThemeProvider} from "@material-ui/core/styles";

const store = configureStore();

const theme = createTheme({

	typography: {
		fontFamily: "'Open Sans', sans-serif"
	},
	palette:{
		// fontFamily: "'Open Sans', sans-serif"
	}

});

render(
	<MuiThemeProvider theme={theme}>
		<Provider store={store}>
			{routes}
		</Provider>

	</MuiThemeProvider>
	, document.getElementById("app")
);
