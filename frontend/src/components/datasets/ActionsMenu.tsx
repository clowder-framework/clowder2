import {Button, Stack} from "@mui/material";
import React from "react";
import {datasetDownloaded} from "../../actions/dataset";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../types/data";
import {Download} from "@mui/icons-material";
import {NewMenu} from "./NewMenu";
import {OtherMenu} from "./OtherMenu";

type ActionsMenuProps = {
	datasetId: string,
	folderId: string
}

export const ActionsMenu = (props: ActionsMenuProps): JSX.Element => {
	const {datasetId, folderId} = props;

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
			<NewMenu datasetId={datasetId} folderId={folderId}/>
			<OtherMenu datasetId={datasetId} folderId={folderId}/>
		</Stack>)
}
