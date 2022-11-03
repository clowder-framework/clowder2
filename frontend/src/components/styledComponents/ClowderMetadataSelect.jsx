import React from "react";
import {styled} from "@mui/styles";
import {Select} from "@mui/material";
import {theme} from "../../theme";


export const ClowderMetadataSelect = styled(Select)({
	background: "#ffffff",
	"& .Mui-disabled": {
		"color": theme.palette.secondary.dark,
		"-webkit-text-fill-color": theme.palette.secondary.dark,
		"background": theme.palette.background.default
	},
	"& .MuiFormHelperText-root":{
		"color": theme.palette.primary.main,
		"background": "#ffffff"
	}
});
