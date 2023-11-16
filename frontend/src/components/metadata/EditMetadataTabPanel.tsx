import React from "react";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import { parseDate } from "../../utils/common";
import {EditMetadata} from "./EditMetadata";
import {Button} from "@mui/material";

type EditMetadataTabPanelProps = {
	datasetId: any;
	setMetadata: any;
	handleMetadataUpdateFinish: any;
	setEnableAddMetadata: any;
};

export const EditMetadataTabPanel = (props: EditMetadataTabPanelProps) => {
	const {datasetId, setMetadata, handleMetadataUpdateFinish, setEnableAddMetadata} = props;
	return (
		<>
			<EditMetadata
				resourceType="dataset"
				resourceId={datasetId}
				setMetadata={setMetadata}
			/>
			<Button
				variant="contained"
				onClick={handleMetadataUpdateFinish}
				sx={{ mt: 1, mr: 1 }}
			>
				Update
			</Button>
			<Button
				onClick={() => {
					setEnableAddMetadata(false);
				}}
				sx={{ mt: 1, mr: 1 }}
			>
				Cancel
			</Button>
		</>
	);
};
