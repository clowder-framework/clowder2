import React from "react";
import Snackbar from "@mui/material/Snackbar";
import { styled } from "@mui/system";

export const ClowderSnackBar = styled(Snackbar)(({ theme }) => ({
	"& .MuiSnackbarContent-root": {
		backgroundColor: "#FFFFFF", // Set your desired background color
		color: theme.palette.primary.main, // Set your desired font color
	},
}));
