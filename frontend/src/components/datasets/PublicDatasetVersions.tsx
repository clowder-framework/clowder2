import { Box, FormControl, MenuItem, Typography } from "@mui/material";
import { ClowderSelect } from "../styledComponents/ClowderSelect";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPublicFreezeDatasets as getPublicFreezeDatasetsAction } from "../../actions/public_dataset";
import { RootState } from "../../types/data";

export const PublicDatasetVersions = (props) => {
	const { currDataset, setSnackBarMessage, setSnackBarOpen } = props;

	const dispatch = useDispatch();
	const getPublicFreezeDatasets = (
		datasetId: string | undefined,
		skip: number,
		limit: number
	) => dispatch(getPublicFreezeDatasetsAction(datasetId, skip, limit));

	const pageMetadata = useSelector(
		(state: RootState) => state.publicDataset.publicFrozenDatasets.metadata
	);
	const frozenDatasets = useSelector(
		(state: RootState) => state.publicDataset.publicFrozenDatasets.data
	);

	const history = useNavigate();

	useEffect(() => {
		// TODO implement proper pagination
		let datasetId;
		if (currDataset.origin_id) datasetId = currDataset.origin_id;
		else datasetId = currDataset.id;
		if (datasetId) getPublicFreezeDatasets(datasetId, 0, 1000);
	}, [currDataset]);

	function handleVersionChange(event) {
		if (event.target.value === "current") {
			history(`/public/datasets/${currDataset.origin_id}`);
			setSnackBarMessage(`Viewing current unreleased dataset.`);
			setSnackBarOpen(true);
		} else {
			const selectedDataset = frozenDatasets.find(
				(dataset) => dataset.id === event.target.value
			);

			if (selectedDataset) {
				history(`/public/datasets/${selectedDataset.id}`);
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
