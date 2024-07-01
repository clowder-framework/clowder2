import React from "react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";

type ActionLevel = "error" | "warning" | "info";

type ActionModalProps = {
	actionOpen: boolean;
	actionTitle: string;
	actionText: string;
	actionBtnName: string;
	handleActionBtnClick: () => void;
	handleActionCancel: () => void;
	actionLevel?: ActionLevel;
};

export const ActionModal: React.FC<ActionModalProps> = (
	props: ActionModalProps
) => {
	const {
		actionOpen,
		actionTitle,
		actionText,
		actionBtnName,
		handleActionBtnClick,
		handleActionCancel,
		actionLevel,
	} = props;

	return (
		<Dialog open={actionOpen} onClose={handleActionCancel} maxWidth={"sm"}>
			<DialogTitle id="confirmation-dialog-title">{actionTitle}</DialogTitle>
			<DialogContent>
				<DialogContentText>{actionText}</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					variant="contained"
					onClick={handleActionBtnClick}
					color={actionLevel ?? "primary"}
				>
					{actionBtnName}
				</Button>
				<Button
					variant="outlined"
					onClick={handleActionCancel}
					color={actionLevel ?? "primary"}
				>
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	);
};
