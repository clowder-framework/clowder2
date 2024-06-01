import React from "react";
import { styled } from "@mui/styles";
import { FormHelperText } from "@mui/material";
import { theme } from "../../theme";

export const ClowderMetadataFormHelperText = styled(FormHelperText)({
	color: theme.palette.primary.main,
	background: "#ffffff",
});
