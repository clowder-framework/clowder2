import { styled } from "@mui/styles";
import { TextField } from "@mui/material";

export const ClowderInput = styled(TextField)({
	width: "100%",
	"& .MuiInputBase-root": {
		width: "100%",
		fontSize: "14px",
		backgroundColor: "#FFFFFF",
		borderRadius: "4px",
	},
});
