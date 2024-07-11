import React from "react";

import { Button, Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { Download } from "@mui/icons-material";
import { NewMenu } from "./NewMenu";
import { OtherMenu } from "./OtherMenu";
import { ShareMenu } from "./ShareMenu";
import { AuthWrapper } from "../auth/AuthWrapper";
import config from "../../app.config";
import { FrozenWrapper } from "../auth/FrozenWrapper";
import { DatasetOut } from "../../openapi/v2";
import { INCREMENT_DATASET_DOWNLOADS } from "../../actions/dataset";

type ActionsMenuProps = {
	folderId: string | null;
	dataset: DatasetOut;
};

export const ActionsMenuGroup = (props: ActionsMenuProps): JSX.Element => {
	const { dataset, folderId } = props;

	const datasetRole = useSelector(
		(state: RootState) => state.dataset.datasetRole
	);
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
						type: INCREMENT_DATASET_DOWNLOADS,
						receivedAt: Date.now(),
					});
					window.location.href = `${config.hostname}/api/v2/datasets/${dataset.id}/download`;
				}}
				endIcon={<Download />}
			>
				Download
			</Button>
			<FrozenWrapper
				frozen={dataset.frozen}
				frozenVersionNum={dataset.frozen_version_num}
			>
				{/*owner, editor, uploader cannot create new*/}
				<AuthWrapper
					currRole={datasetRole.role}
					allowedRoles={["owner", "editor", "uploader"]}
				>
					<NewMenu datasetId={dataset.id} folderId={folderId} />
				</AuthWrapper>
				{/*owner can delete and perform sharing tasks*/}
				<AuthWrapper currRole={datasetRole.role} allowedRoles={["owner"]}>
					<ShareMenu datasetId={dataset.id} datasetName={dataset.name} />
				</AuthWrapper>
				{/*owner and editor can perform editing tasks*/}
				<AuthWrapper
					currRole={datasetRole.role}
					allowedRoles={["owner", "editor"]}
				>
					<OtherMenu datasetId={dataset.id} datasetName={dataset.name} />
				</AuthWrapper>
			</FrozenWrapper>
		</Stack>
	);
};
