import {Button, Stack} from "@mui/material";
import React from "react";
import {datasetDownloaded} from "../../actions/dataset";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../types/data";
import {Download} from "@mui/icons-material";
import {NewMenu} from "./NewMenu";
import {OtherMenu} from "./OtherMenu";
import {EditMenu} from "./EditMenu";
import {AuthWrapper} from "../auth/AuthWrapper";

type ActionsMenuProps = {
	datasetId: string,
	folderId: string,
    	datasetName: string
}

export const ActionsMenu = (props: ActionsMenuProps): JSX.Element => {
	const {datasetId, folderId, datasetName} = props;

	const datasetRole = useSelector((state: RootState) => state.dataset.datasetRole);

	// redux
	const dispatch = useDispatch();

	const downloadDataset = (datasetId: string | undefined, filename: string | undefined) => dispatch(datasetDownloaded(datasetId, filename))

	// state
	const about = useSelector((state: RootState) => state.dataset.about);

	return (
		<Stack direction="row"
			   justifyContent="flex-end"
			   alignItems="center"
			   spacing={0.5}>
			<Button variant="contained"
					onClick={() => {
						downloadDataset(datasetId, about["name"]);
					}} endIcon={<Download/>}>
				Download
			</Button>
			{/*owner, editor, uploader cannot create new*/}
			{
				<AuthWrapper currRole={datasetRole.role} allowedRoles={["owner", "editor", "uploader"]}>
					<NewMenu datasetId={datasetId} folderId={folderId}/>
				</AuthWrapper>
			}
			{/*owner, editor can edit*/}
			{
				<AuthWrapper currRole={datasetRole.role} allowedRoles={["owner", "editor"]}>
					<EditMenu datasetId={datasetId} folderId={folderId}/>
				</AuthWrapper>
			}
			{/*owner can delete and perform other tasks*/}
			{
				<AuthWrapper currRole={datasetRole.role} allowedRoles={["owner"]}>
					<OtherMenu datasetId={datasetId} folderId={folderId} datasetName={datasetName}/>
				</AuthWrapper>
			}
		</Stack>)
}
