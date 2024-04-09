import React from "react";
import { styled } from "@mui/styles";
import { Typography } from "@mui/material";
import { theme } from "../../theme";

export const ClowderInputLabel = styled(Typography)({
	color: theme.palette.primary.main,
	fontSize: "14px",
	fontWeight: "500",
});
