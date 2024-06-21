import { Button, Stack } from "@mui/material";
import React from "react";
import { Download } from "@mui/icons-material";
import config from "../../app.config";
import { useDispatch } from "react-redux";
import { downloadDataset } from "../../actions/dataset";
import { downloadPublicDataset } from "../../actions/public_dataset";

type ActionsMenuProps = {
	datasetId: string;
};

export const PublicActionsMenu = (props: ActionsMenuProps): JSX.Element => {
	const { datasetId } = props;
	const dispatch = useDispatch();

	const download = (datasetId: string | undefined) =>
		dispatch(downloadPublicDataset(datasetId));

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
				onClick={() => download(datasetId)}
				endIcon={<Download />}
			>
				Download
			</Button>
		</Stack>
	);
};
