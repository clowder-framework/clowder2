import React from "react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";

type ActionModalProps = {
	actionOpen: boolean;
	actionTitle: string;
	actionText: string;
	actionBtnName: string;
	// TODO properly define below functions
	handleActionBtnClick: any;
	handleActionCancel: any;
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
	} = props;
	return (
		<Dialog open={actionOpen} onClose={handleActionCancel} maxWidth={"sm"}>
			<DialogTitle id="confirmation-dialog-title">{actionTitle}</DialogTitle>
			<DialogContent>
				<DialogContentText>{actionText}</DialogContentText>
			</DialogContent>
			<DialogActions>
				{/*handleActionBtnClick This could be used to report error/ confirm deletion and so on*/}
				<Button variant="contained" onClick={handleActionBtnClick}>
					{actionBtnName}
				</Button>
				<Button variant="outlined" onClick={handleActionCancel}>
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	);
};
