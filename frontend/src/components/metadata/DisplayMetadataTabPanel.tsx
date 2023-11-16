import React from "react";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import { parseDate } from "../../utils/common";
import {EditMetadata} from "./EditMetadata";
import {Box, Button} from "@mui/material";
import {DisplayMetadata} from "./DisplayMetadata";

type DisplayMetadataTabPanelProps = {
	datasetId: any;
	updateDatasetMetadata: any;
	deleteDatasetMetadata: any;
	setEnableAddMetadata: any;
};

export const EditMetadataTabPanel = (props: DisplayMetadataTabPanelProps) => {
	const {datasetId, updateDatasetMetadata, deleteDatasetMetadata, setEnableAddMetadata} = props;
	return (
		<>
			<DisplayMetadata
				updateMetadata={updateDatasetMetadata}
				deleteMetadata={deleteDatasetMetadata}
				resourceType="dataset"
				resourceId={datasetId}
			/>
			<Box textAlign="center">
				<Button
					variant="contained"
					sx={{ m: 2 }}
					onClick={() => {
						setEnableAddMetadata(true);
					}}
				>
										Add Metadata
				</Button>
			</Box>
		</>
	);
};
