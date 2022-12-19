import { createTheme } from '@mui/material/styles';

// A custom theme for this app
export const theme = createTheme({
	typography: {
		fontFamily: [
			'Open Sans',
			'sans-serif',
		].join(','),
	},
	palette:{
		primary:{
			light: "#f7941e",
			main: "#F7941E",
			dark: "#e65100",
			contrastText: '#FFFFFF',
		},
		secondary:{
			light: "#868E96",
			main: "#6C757D",
			dark: "#333333",
		},
		info:{
			main:"#0086A1"
		},
		background: {
			default: "#F8F8F8"
		}
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
		textColor: theme.palette.secondary.dark,
		primaryTextColor: theme.palette.primary.contrastText,
		primaryColor: theme.palette.primary.main,
		titleColor: theme.palette.secondary.dark,
		alertColor: theme.palette.primary.dark,
	}
};
