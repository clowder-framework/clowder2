import React from "react";

import { Button, Stack, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { Download } from "@mui/icons-material";
import { NewMenu } from "./NewMenu";
import { OtherMenu } from "./OtherMenu";
import { ShareMenu } from "./ShareMenu";
import { AuthWrapper } from "../auth/AuthWrapper";
import config from "../../app.config";
import { PublishedWrapper } from "../auth/PublishedWrapper";
import { CombinedDataset } from "../../openapi/v2";
import LockIcon from "@mui/icons-material/Lock";
import EditNoteIcon from "@mui/icons-material/EditNote";

import {
	draftFreezeDataset as draftFreezeDatasetAction,
	freezeDataset as freezeDatasetAction,
} from "../../actions/dataset";

type ActionsMenuProps = {
	folderId: string | null;
	dataset: CombinedDataset;
};

export const ActionsMenuGroup = (props: ActionsMenuProps): JSX.Element => {
	const { dataset, folderId } = props;

	const datasetRole = useSelector(
		(state: RootState) => state.dataset.datasetRole
	);
	const dispatch = useDispatch();
	const freezeDataset = (datasetId: string | undefined) =>
		dispatch(freezeDatasetAction(datasetId));
	const draftFreezeDataset = (frozenDatasetId: string | undefined) =>
		dispatch(draftFreezeDatasetAction(frozenDatasetId));

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
				href={`${config.hostname}/api/v2/datasets/${dataset.id}/download`}
				endIcon={<Download />}
			>
				Download
			</Button>
			<PublishedWrapper
				frozen={dataset.frozen}
				frozenVersionNum={dataset.frozen_version_num}
			>
				{/*onwer can publish*/}
				<AuthWrapper currRole={datasetRole.role} allowedRoles={["owner"]}>
					{/*TODO some logic to determine showing one or another*/}
					<Tooltip title="Published datasets are frozen and cannot be altered; updates require creating a new version.">
						<Button
							sx={{ minWidth: "auto" }}
							variant="outlined"
							endIcon={<LockIcon />}
							onClick={() => {
								freezeDataset(dataset.id);
							}}
						>
							Freeze
						</Button>
					</Tooltip>
				</AuthWrapper>
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
			</PublishedWrapper>

			{/*Frozen items can have draft button*/}
			<PublishedWrapper
				frozen={dataset.frozen}
				frozenVersionNum={dataset.frozen_version_num}
			>
				{/*onwer can draft*/}
				<AuthWrapper currRole={datasetRole.role} allowedRoles={["owner"]}>
					<Tooltip title="Draft the next version of this dataset.">
						<Button
							sx={{ minWidth: "auto" }}
							variant="outlined"
							endIcon={<EditNoteIcon />}
							onClick={() => {
								draftFreezeDataset(dataset.id);
							}}
						>
							Draft
						</Button>
					</Tooltip>
				</AuthWrapper>
			</PublishedWrapper>
		</Stack>
	);
};
