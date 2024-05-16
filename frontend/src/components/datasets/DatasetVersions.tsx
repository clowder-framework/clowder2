import React, { ChangeEvent, useEffect, useState } from "react";
import { Box, Link, Pagination, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getFreezeDatasets as getFreezeDatasetsAction } from "../../actions/dataset";
import { RootState } from "../../types/data";
import config from "../../app.config";
import { parseDate } from "../../utils/common";
import { theme } from "../../theme";

export const DatasetVersions = (props) => {
	const { currDataset, setSnackBarMessage, setSnackBarOpen } = props;
	const dispatch = useDispatch();
	const [selectedId, setSelectedId] = useState(currDataset.id);
	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultVersionPerPage);

	const getFreezeDatasets = (
		datasetId: string | undefined,
		skip: number,
		limit: number
	) => dispatch(getFreezeDatasetsAction(datasetId, skip, limit));

	const latestFrozenVersionNum = useSelector(
		(state: RootState) => state.dataset.latestFrozenVersionNum
	);
	const frozenDatasets = useSelector(
		(state: RootState) => state.dataset.frozenDatasets.data
	);
	const pageMetadata = useSelector(
		(state: RootState) => state.dataset.frozenDatasets.metadata
	);

	const history = useNavigate();

	useEffect(() => {
		// TODO implement proper pagination
		let datasetId;
		if (currDataset.origin_id) datasetId = currDataset.origin_id;
		else datasetId = currDataset.id;
		if (datasetId) getFreezeDatasets(datasetId, 0, limit);
	}, [currDataset, latestFrozenVersionNum]);

	const handleVersionChange = (
		selectedDatasetId: string,
		selectedVersionNum: string
	) => {
		setSelectedId(selectedDatasetId);
		history(`/datasets/${selectedDatasetId}`);
		setSnackBarMessage(`Viewing dataset version ${selectedVersionNum}.`);
		setSnackBarOpen(true);
	};

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const originDatasetId = currDataset.origin_id;
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		getFreezeDatasets(originDatasetId, newSkip, limit);
	};

	return (
		<Box sx={{ mt: 2, mb: 5 }}>
			<Typography variant="h5" gutterBottom>
				Dataset Version
			</Typography>
			<Box>
				<Box key={currDataset.origin_id} mb={2}>
					<Link
						component="button"
						onClick={() => {
							handleVersionChange(currDataset.origin_id, "current unreleased");
						}}
						sx={{
							color:
								selectedId === currDataset.origin_id
									? theme.palette.info.main
									: theme.palette.primary.main,
							pointerEvents:
								selectedId === currDataset.origin_id ? "none" : "auto",
							textDecoration: "none",
							fontWeight:
								selectedId === currDataset.origin_id ? "bold" : "normal",
							"&:hover": {
								textDecoration: "underline",
							},
						}}
					>
						Current Unreleased
					</Link>
				</Box>
				{frozenDatasets.map((dataset) => (
					<Box key={dataset.id} mb={2}>
						<Link
							component="button"
							onClick={() => {
								handleVersionChange(dataset.id, dataset.frozen_version_num);
							}}
							sx={{
								color:
									selectedId === dataset.id
										? theme.palette.info.main
										: theme.palette.primary.main,
								pointerEvents: selectedId === dataset.id ? "none" : "auto",
								textDecoration: "none",
								fontWeight: selectedId === dataset.id ? "bold" : "normal",
								"&:hover": {
									textDecoration: "underline",
								},
							}}
						>
							Version {dataset.frozen_version_num}
						</Link>
						<Box>
							<Typography
								variant="caption"
								sx={{ color: "text.primary.light" }}
							>
								{parseDate(dataset.modified)}
							</Typography>
						</Box>
					</Box>
				))}
			</Box>
			{frozenDatasets && frozenDatasets.length !== 0 ? (
				<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
					<Pagination
						count={Math.ceil(pageMetadata.total_count / limit)}
						page={currPageNum}
						onChange={handlePageChange}
						shape="rounded"
						variant="outlined"
					/>
				</Box>
			) : (
				<></>
			)}
		</Box>
	);
};
