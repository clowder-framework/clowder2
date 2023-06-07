import { ActionModal } from "../dialog/ActionModal";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { handleErrorReport } from "../../utils/common";

type ErrorModalProps = {
	errorOpen: boolean;
	setErrorOpen: any;
	dismissError: any;
};

export const ErrorModal = (props: ErrorModalProps) => {
	const { errorOpen, setErrorOpen, dismissError } = props;

	const reason = useSelector((state: RootState) => state.error.reason);
	const stack = useSelector((state: RootState) => state.error.stack);

	// Error msg dialog
	useEffect(() => {
		if (reason !== "" && reason !== null && reason !== undefined) {
			setErrorOpen(true);
		}
	}, [reason]);
	const handleErrorCancel = () => {
		// reset error message and close the error window
		dismissError();
		setErrorOpen(false);
	};

	return (
		<ActionModal
			actionOpen={errorOpen}
			actionTitle="Something went wrong..."
			actionText={reason}
			actionBtnName="Report"
			handleActionBtnClick={() => {
				handleErrorReport(reason, stack);
			}}
			handleActionCancel={handleErrorCancel}
		/>
	);
};
