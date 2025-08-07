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
	displayCheckbox: boolean;
	checkboxLabel: string;
	checkboxSelected: boolean;
	publishDOI: boolean;
	setCheckboxSelected: (value: boolean) => void;
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
		displayCheckbox,
		checkboxLabel,
		checkboxSelected,
		setCheckboxSelected,
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
				<br hidden={!displayCheckbox} />
				<FormControlLabel
					value={"end"}
					control={
						<Checkbox
							defaultChecked={checkboxSelected}
							onChange={() => {
								setCheckboxSelected(!checkboxSelected);
							}}
						/>
					}
					sx={{ display: displayCheckbox ? "block" : "none" }}
					label={checkboxLabel}
				/>
			</DialogContent>
			<DialogActions>
				<Button
					variant="outlined"
					onClick={handleActionCancel}
					color={actionLevel ?? "primary"}
				>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={handleActionBtnClick}
					color={actionLevel ?? "primary"}
				>
					{actionBtnName}
				</Button>
			</DialogActions>
		</Dialog>
	);
};
