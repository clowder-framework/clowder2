import React from "react";
import { styled } from "@mui/styles";
import { Select } from "@mui/material";
import { theme } from "../../theme";

export const ClowderSelect = styled(Select)({
	background: "#ffffff",
	"& .Mui-disabled": {
		color: theme.palette.primary.light,
		"-webkit-text-fill-color": theme.palette.primary.light,
		background: theme.palette.background.default,
	},
	"& .MuiFormHelperText-root": {
		color: theme.palette.primary.main,
		background: "#ffffff",
	},
});
