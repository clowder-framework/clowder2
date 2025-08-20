import { Button, Stack } from "@mui/material";
import React from "react";
import { Download } from "@mui/icons-material";
import config from "../../app.config";
import { useDispatch } from "react-redux";
import { INCREMENT_PUBLIC_DATASET_DOWNLOADS } from "../../actions/public_dataset";

type ActionsMenuProps = {
	datasetId: string;
};

export const PublicActionsMenu = (props: ActionsMenuProps): JSX.Element => {
	const { datasetId } = props;

	const dispatch = useDispatch();
	return (
		<Stack
			direction="row"
			justifyContent="flex-end"
			alignItems="center"
			spacing={0.5}
		>
			<Button
				sx={{ minWidth: "auto" }}
				variant="contained"
				onClick={() => {
					dispatch({
						type: INCREMENT_PUBLIC_DATASET_DOWNLOADS,
						receivedAt: Date.now(),
					});
					window.location.href = `${config.hostname}/api/v2/public_datasets/${datasetId}/download`;
				}}
				endIcon={<Download />}
			>
				Download
			</Button>
		</Stack>
	);
};
