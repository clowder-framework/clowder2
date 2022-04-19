import {styled} from "@mui/styles";
import {TextField} from "@mui/material";

export const ClowderInput = styled(TextField)({
	width: "100%",
	"& .MuiInputBase-root":{
		height: "41px",
		width: "100%",
		fontSize: "16px",
		padding:"6px 12px",
		border:"1px solid",
		borderRadius: "4px",
	},
});
