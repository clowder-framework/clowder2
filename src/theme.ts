import { createTheme } from '@mui/material/styles';

// A custom theme for this app
const theme = createTheme({
	typography: {
		fontFamily: [
			'Open Sans',
			'sans-serif',
		].join(','),
	},
	palette:{
		primary:{
			light: "#F7941E",
			main: "#F7941E",
			dark: "#e65100",
			contrastText: '#ffffff',
		},
		secondary:{
			light: "#868E96",
			main: "#6C757D",
			dark: "#333333",
		},
		info:{
			main:"#0086A1"
		}
	}
});

export default theme;
