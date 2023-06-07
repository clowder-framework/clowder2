import * as React from "react";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";
import { RootState } from "../../types/data";

export const InlineAlert = () => {
	const [open, setOpen] = React.useState(true);

	const reason = useSelector((state: RootState) => state.error.reason);

	useEffect(() => {
		if (reason !== "" && reason !== null && reason !== undefined) {
			setOpen(true);
		}
	}, [reason]);

	return (
		<Box sx={{ width: "100%" }}>
			<Collapse in={open}>
				<Alert
					action={
						<IconButton
							aria-label="close"
							color="inherit"
							size="small"
							onClick={() => {
								setOpen(false);
							}}
						>
							<CloseIcon fontSize="inherit" />
						</IconButton>
					}
					sx={{ mb: 2 }}
				>
					{reason}
				</Alert>
			</Collapse>
		</Box>
	);
};
