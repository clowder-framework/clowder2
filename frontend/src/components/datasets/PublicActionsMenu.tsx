import { Button, Stack } from "@mui/material";
import React from "react";
import { Download } from "@mui/icons-material";
import config from "../../app.config";

type ActionsMenuProps = {
	datasetId: string;
};

export const PublicActionsMenu = (props: ActionsMenuProps): JSX.Element => {
	const { datasetId } = props;

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
				href={`${config.hostname}/api/v2/public_datasets/${datasetId}/download`}
				endIcon={<Download />}
			>
				Download
			</Button>
		</Stack>
	);
};
