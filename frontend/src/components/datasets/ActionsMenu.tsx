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

export const ActionsMenu = (props: ActionsMenuProps): JSX.Element => {
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
			{
				<AuthWrapper
					currRole={datasetRole.role}
					allowedRoles={["owner", "editor", "uploader"]}
				>
					<NewMenu datasetId={datasetId} folderId={folderId} />
				</AuthWrapper>
			}
			{/*owner can delete and perform other tasks*/}
			{
				<AuthWrapper currRole={datasetRole.role} allowedRoles={["owner"]}>
					<ShareMenu
						datasetId={datasetId}
						folderId={folderId}
						datasetName={datasetName}
					/>
				</AuthWrapper>
			}
			{
				<AuthWrapper
					currRole={datasetRole.role}
					allowedRoles={["owner", "editor"]}
				>
					<OtherMenu
						datasetId={datasetId}
						folderId={folderId}
						datasetName={datasetName}
					/>
				</AuthWrapper>
			}
		</Stack>
	);
};
