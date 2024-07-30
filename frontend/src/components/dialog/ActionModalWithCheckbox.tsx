import React from "react";
import {
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControlLabel,
} from "@mui/material";

type ActionLevel = "error" | "warning" | "info";

type ActionModalProps = {
	actionOpen: boolean;
	actionTitle: string;
	actionText: string;
	checkboxLabel: string;
	checkboxSelected: boolean;
	publishDOI: boolean;
	setPublishDOI: (value: boolean) => void;
	actionBtnName: string;
	handleActionBtnClick: () => void;
	handleActionCancel: () => void;
	actionLevel?: ActionLevel;
};

export const ActionModalWithCheckbox: React.FC<ActionModalProps> = (
	props: ActionModalProps
) => {
	const {
		actionOpen,
		actionTitle,
		actionText,
		checkboxLabel,
		checkboxSelected,
		publishDOI,
		setPublishDOI,
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
				<FormControlLabel
					control={
						<Checkbox
							size={"small"}
							defaultChecked={checkboxSelected}
							onChange={() => {
								setPublishDOI(!publishDOI);
							}}
						/>
					}
					label={checkboxLabel}
				/>
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
