import { Box, FormControl, MenuItem, Typography } from "@mui/material";
import { ClowderSelect } from "../styledComponents/ClowderSelect";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getFreezeDatasets as getFreezeDatasetsAction } from "../../actions/dataset";
import { RootState } from "../../types/data";

export const DatasetVersions = (props) => {
	const { setSnackBarMessage, setSnackBarOpen } = props;

	const dispatch = useDispatch();
	const getFreezeDatasets = (
		datasetId: string | undefined,
		skip: number,
		limit: number
	) => dispatch(getFreezeDatasetsAction(datasetId, skip, limit));

	const latestFrozenVersionNum = useSelector(
		(state: RootState) => state.dataset.latestFrozenVersionNum
	);
	const pageMetadata = useSelector(
		(state: RootState) => state.dataset.frozenDatasets.metadata
	);
	const frozenDatasets = useSelector(
		(state: RootState) => state.dataset.frozenDatasets.data
	);
	const currDataset = useSelector((state: RootState) => state.dataset.about);

	const history = useNavigate();

	const [selectedDatasetId, setSelectedDatasetId] = useState<string>("current");

	useEffect(() => {
		// TODO implement proper pagination
		if (currDataset.origin_id)
			getFreezeDatasets(currDataset.origin_id, 0, 1000);
	}, [currDataset, latestFrozenVersionNum]);

	function handleVersionChange(event) {
		if (event.target.value === "current") {
			history(`/datasets/${currDataset.origin_id}`);
			setSelectedDatasetId("current");
			setSnackBarMessage(`Viewing current unreleased dataset.`);
			setSnackBarOpen(true);
		} else {
			const selectedDataset = frozenDatasets.find(
				(dataset) => dataset.id === event.target.value
			);

			if (selectedDataset) {
				history(`/datasets/${selectedDataset.id}`);
				setSelectedDatasetId(selectedDataset.id);
				setSnackBarMessage(
					`Viewing dataset version ${selectedDataset.frozen_version_num}.`
				);
				setSnackBarOpen(true);
			} else {
				console.error("Selected dataset not found in the list");
			}
		}
	}

	return (
		<Box sx={{ mt: 2, mb: 5 }}>
			<Typography variant="h5" gutterBottom>
				Dataset Version
			</Typography>
			<Typography>Select Version</Typography>
			<FormControl>
				<ClowderSelect
					value={
						currDataset &&
						currDataset.frozen &&
						currDataset.frozen_version_num > 0
							? currDataset.id
							: "current"
					}
					onChange={handleVersionChange}
				>
					<MenuItem value="current" key="current">
						Current
					</MenuItem>
					{frozenDatasets && frozenDatasets.length > 0
						? frozenDatasets.map((dataset) => {
								return (
									<MenuItem value={dataset.id} key={dataset.id}>
										{`Version ${dataset.frozen_version_num}`}
									</MenuItem>
								);
						  })
						: null}
				</ClowderSelect>
			</FormControl>
		</Box>
	);
};
