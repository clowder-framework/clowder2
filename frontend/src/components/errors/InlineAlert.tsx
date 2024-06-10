import * as React from "react";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { resetFailedReasonInline } from "../../actions/common";

type InlineAlertProps = {
	alertOpen: boolean;
	setAlertOpen: any;
};

export const InlineAlert = (props: InlineAlertProps) => {
	const { alertOpen, setAlertOpen } = props;

	const dispatch = useDispatch();

	const reasonInline = useSelector(
		(state: RootState) => state.error.reasonInline,
	);

	useEffect(() => {
		if (
			reasonInline !== "" &&
			reasonInline !== null &&
			reasonInline !== undefined
		) {
			setAlertOpen(true);
		} else {
			setAlertOpen(false);
		}
	}, [reasonInline]);
	const handleAlertCancel = () => {
		dispatch(resetFailedReasonInline());
		setAlertOpen(false);
	};

	return (
		<Box sx={{ width: "100%" }}>
			<Collapse in={alertOpen}>
				<Alert
					action={
						<IconButton
							aria-label="close"
							color="inherit"
							size="small"
							onClick={handleAlertCancel}
						>
							<CloseIcon fontSize="inherit" />
						</IconButton>
					}
					sx={{ mb: 2 }}
					severity="error"
				>
					{reasonInline}
				</Alert>
			</Collapse>
		</Box>
	);
};
