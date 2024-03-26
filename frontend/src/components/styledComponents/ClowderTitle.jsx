import React from "react";
import { styled } from "@mui/styles";
import { Typography } from "@mui/material";
import { theme } from "../../theme";

export const ClowderTitle = styled(Typography)({
	color: theme.palette.primary.main,
	fontSize: "16px",
	fontWeight: "500",
	textTransform: "uppercase",
});
