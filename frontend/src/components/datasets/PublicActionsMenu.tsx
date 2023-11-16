import { Button, Stack } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { Download } from "@mui/icons-material";
import { NewMenu } from "./NewMenu";
import { OtherMenu } from "./OtherMenu";
import { ShareMenu } from "./ShareMenu";
import { AuthWrapper } from "../auth/AuthWrapper";
import config from "../../app.config";

type ActionsMenuProps = {
	datasetId: string;
	folderId: string;
	datasetName: string;
};

export const PublicActionsMenu = (props: ActionsMenuProps): JSX.Element => {
	const { datasetId, folderId, datasetName } = props;

	const datasetRole = useSelector(
		(state: RootState) => state.dataset.datasetRole
	);

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
				href={`${config.hostname}/api/v2/datasets/${datasetId}/download`}
				endIcon={<Download />}
			>
				Download
			</Button>
			{/*owner, editor, uploader cannot create new*/}
		</Stack>
	);
};
