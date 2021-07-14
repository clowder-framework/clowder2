import {styled} from "@material-ui/core/styles";
import {TextField} from "@material-ui/core";

export const IncoreTextField = styled(TextField)({
	width: "100%",
	"& .MuiInputBase-root":{
		height: "41px",
		width: "100%",
		color: "#2E384D",
		fontSize: "15px",
		fontWeight: 500,
		letterSpacing: 0,
		lineHeight: "18px",
		backgroundColor: "#FFFFFF"
	}
});
