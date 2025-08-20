import { createTheme } from "@mui/material/styles";

// A custom theme for this app
export const theme = createTheme({
	typography: {
		fontFamily: ["Open Sans", "sans-serif"].join(","),
	},
	palette: {
		primary: {
			light: "rgb(73, 103, 151)",
			main: "#1c427d",
			dark: "rgb(19, 46, 87)",
			contrastText: "#fff",
		},
		secondary: {
			light: "rgb(197, 73, 73)",
			main: "#b71c1c",
			dark: "rgb(128, 19, 19)",
			contrastText: "#fff",
		},
		info: {
			main: "rgba(0, 0, 0, 0.6)",
		},
		background: {
			default: "#F8F8F8",
		},
	},
	components: {
		MuiAppBar: {
			styleOverrides: {
				colorInherit: {
					backgroundColor: "#FFFFFF",
					boxShadow: "none",
				},
			},
			defaultProps: {
				color: "inherit",
			},
		},
	},
});

export const searchTheme = {
	typography: {
		fontFamily: theme.typography.fontFamily,
		fontSize: "16px",
	},
	colors: {
		textColor: theme.palette.primary.light,
		primaryTextColor: theme.palette.primary.contrastText,
		primaryColor: theme.palette.primary.main,
		titleColor: theme.palette.primary.light,
		alertColor: theme.palette.primary.dark,
	},
};
