import React from "react";
import {styled} from "@mui/styles";
import {Typography} from "@mui/material";
import {theme} from "../../theme";

export const ClowderFootnote = styled(Typography)({
	"color": theme.palette.secondary.light,
	"fontSize": "14px",
});
