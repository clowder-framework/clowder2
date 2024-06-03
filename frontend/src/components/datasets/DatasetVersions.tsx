import React, { ChangeEvent, useEffect, useState } from "react";
import { Box, Link, Pagination, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getFreezeDatasets as getFreezeDatasetsAction } from "../../actions/dataset";
import { RootState } from "../../types/data";
import config from "../../app.config";
import { parseDate, selectedHighlightStyles } from "../../utils/common";
import { theme } from "../../theme";

export const DatasetVersions = (props) => {
	// search parameters
	const [searchParams] = useSearchParams();
	const currVersionPageNumParam = searchParams.get("currVersionPageNum");

	const { currDataset } = props;
	const dispatch = useDispatch();
	const [currVersionPageNum, setCurrVersionPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultVersionPerPage);
	const [skip, setSkip] = useState<number>(0);

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
		if (currVersionPageNumParam) {
			const pageNum = parseInt(currVersionPageNumParam, 10);
			setCurrVersionPageNum(pageNum);
			setSkip((pageNum - 1) * limit);
		}
	}, [currVersionPageNumParam]);

	useEffect(() => {
		let datasetId;
		if (currDataset.origin_id) datasetId = currDataset.origin_id;
		else datasetId = currDataset.id;
		if (datasetId) getFreezeDatasets(datasetId, skip, limit);
	}, [currDataset, latestFrozenVersionNum, skip, limit]);

	const handleVersionChange = (selectedDatasetId: string) => {
		// current version flip to page 1
		if (selectedDatasetId === currDataset.origin_id) {
			history(`/datasets/${selectedDatasetId}?currVersionPageNum=1`);
			// other version flip to the current page
		} else {
			history(
				`/datasets/${selectedDatasetId}?currVersionPageNum=${currVersionPageNum}`
			);
		}
	};

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const originDatasetId = currDataset.origin_id;
		const newSkip = (value - 1) * limit;
		setCurrVersionPageNum(value);
		setSkip(newSkip);
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
							handleVersionChange(currDataset.origin_id);
						}}
						sx={selectedHighlightStyles(
							currDataset.id,
							currDataset.origin_id,
							theme
						)}
					>
						Current Unreleased
					</Link>
				</Box>
				{frozenDatasets.map((dataset) => (
					<Box key={dataset.id} mb={2}>
						<Link
							component="button"
							onClick={() => {
								handleVersionChange(dataset.id);
							}}
							sx={selectedHighlightStyles(currDataset.id, dataset.id, theme)}
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
						page={currVersionPageNum}
						onChange={handlePageChange}
						shape="circular"
					/>
				</Box>
			) : (
				<></>
			)}
		</Box>
	);
};
