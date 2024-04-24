import { styled } from "@mui/styles";
import { Typography } from "@mui/material";
import { theme } from "../../theme";

export const ClowderVersionTextLight = styled(Typography)({
	color: theme.palette.primary.light,
	fontSize: "14px",
	border: "solid 1px",
	borderRadius: "5px",
	padding: "0 5px",
});

export const ClowderVersionTextDark = styled(Typography)({
	backgroundColor: theme.palette.primary.light,
	color: theme.palette.primary.contrastText,
	fontSize: "14px",
	border: "solid 1px",
	borderRadius: "5px",
	padding: "0 5px",
});

export const ClowderVersionPill = styled(Typography)({
	backgroundColor: "#eeeeee",
	color: theme.palette.info.main,
	fontSize: "1.5rem",
	borderRadius: "5px",
	padding: "0.5em",
	textTransform: "uppercase",
	textAlign: "center",
	minWidth: "2em",
});
