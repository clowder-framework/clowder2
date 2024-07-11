import React, { ChangeEvent, useEffect, useState } from "react";
import { Box, Link, Pagination, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	deleteFreezeDataset as deleteFreezeDatasetAction,
	getFreezeDatasets as getFreezeDatasetsAction,
} from "../../../actions/dataset";
import { RootState } from "../../../types/data";
import config from "../../../app.config";
import {
	highlightLatestStyles,
	parseDate,
	selectedHighlightStyles,
} from "../../../utils/common";
import { theme } from "../../../theme";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import { ActionModal } from "../../dialog/ActionModal";
import { DatasetFreezeOut } from "../../../openapi/v2";

export const DatasetVersions = (props) => {
	// search parameters
	const [searchParams] = useSearchParams();
	const currVersionPageNumParam = searchParams.get("currVersionPageNum");

	const { currDataset } = props;
	const dispatch = useDispatch();
	const [currVersionPageNum, setCurrVersionPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultVersionPerPage);
	const [skip, setSkip] = useState<number>(0);
	const [selectedDatasetVersion, setSelectedDatasetVersion] =
		useState<DatasetFreezeOut>();
	const [deleteDatasetVersionConfirmOpen, setDeleteDatasetVersionConfirmOpen] =
		useState(false);

	const getFreezeDatasets = (
		datasetId: string | undefined,
		skip: number,
		limit: number
	) => dispatch(getFreezeDatasetsAction(datasetId, skip, limit));

	const deleteFreezeDataset = (
		datasetId: string | undefined,
		frozenVersionNum: number
	) => {
		dispatch(deleteFreezeDatasetAction(datasetId, frozenVersionNum));
	};

	const latestFrozenVersionNum = useSelector(
		(state: RootState) => state.dataset.latestFrozenVersionNum
	);
	const deletedFrozenDataset = useSelector(
		(state: RootState) => state.dataset.deletedFrozenDataset
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
	}, [currDataset, deletedFrozenDataset, latestFrozenVersionNum, skip, limit]);

	const handleVersionChange = (selectedDatasetId: string) => {
		// current version flip to page 1
		if (
			(currDataset.frozen == false && currDataset.frozen_version_num == -999) ||
			currDataset.id === currDataset.origin_id
		) {
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

	// delete dataset version
	const deleteSelectedDatasetVersion = () => {
		if (
			selectedDatasetVersion &&
			selectedDatasetVersion.origin_id &&
			selectedDatasetVersion.frozen_version_num
		)
			deleteFreezeDataset(
				selectedDatasetVersion.origin_id,
				selectedDatasetVersion.frozen_version_num
			);
		// after delete go to the current version
		history(`/datasets/${currDataset.origin_id}?currVersionPageNum=1`);
		setDeleteDatasetVersionConfirmOpen(false);
	};

	return (
		<>
			<ActionModal
				actionOpen={deleteDatasetVersionConfirmOpen}
				actionTitle="Delete Dataset"
				actionText="Are you sure you want to delete this version? This process cannot be undone.
				All files, folders, metadata, visualizations, and thumbnails associated with this version will be
				permanently deleted."
				actionBtnName="Delete"
				handleActionBtnClick={deleteSelectedDatasetVersion}
				handleActionCancel={() => {
					setDeleteDatasetVersionConfirmOpen(false);
				}}
				actionLevel={"error"}
			/>
			<Box sx={{ mt: 2, mb: 5 }}>
				<Typography variant="h5" gutterBottom>
					Version
				</Typography>
				<Box>
					<Box key={currDataset.origin_id} mb={2}>
						<Link
							component="button"
							onClick={() => {
								handleVersionChange(currDataset.origin_id);
							}}
							sx={highlightLatestStyles(
								currDataset.frozen,
								currDataset.frozen_version_num,
								currDataset.id,
								currDataset.origin_id,
								theme
							)}
						>
							Latest
						</Link>
						<Box>
							<Typography
								variant="caption"
								sx={{
									color: "text.primary.light",
									fontWeight:
										(currDataset.frozen == false &&
											currDataset.frozen_version_num == -999) ||
										currDataset.id === currDataset.origin_id
											? "bold"
											: "normal",
								}}
							>
								Last Modified: {parseDate(currDataset.modified)}
							</Typography>
						</Box>
					</Box>
					{frozenDatasets.map((dataset) =>
						dataset.deleted ? (
							<Box key={dataset.id} mb={2}>
								<Typography
									variant="body1"
									style={{
										color: theme.palette.info.main,
									}}
								>
									Version {dataset.frozen_version_num} (Deleted)
								</Typography>
								<Box>
									<Typography
										variant="caption"
										sx={{ color: "text.primary.light" }}
									>
										Last Modified: {parseDate(dataset.modified)}
									</Typography>
								</Box>
							</Box>
						) : (
							<Box key={dataset.id} mb={2}>
								<Box
									display="flex"
									justifyContent="space-between"
									alignItems="center"
								>
									<Link
										component="button"
										onClick={() => {
											handleVersionChange(dataset.id);
										}}
										sx={selectedHighlightStyles(
											currDataset.id,
											dataset.id,
											theme
										)}
									>
										Version {dataset.frozen_version_num}
									</Link>
									<IconButton
										aria-label="delete"
										size="small"
										onClick={() => {
											setSelectedDatasetVersion(dataset);
											setDeleteDatasetVersionConfirmOpen(true);
										}}
									>
										<DeleteIcon />
									</IconButton>
								</Box>
								<Box>
									<Typography
										variant="caption"
										sx={{
											color: "text.primary.light",
											fontWeight:
												currDataset.id === dataset.id ? "bold" : "normal",
										}}
									>
										Last Modified: {parseDate(dataset.modified)}
									</Typography>
								</Box>
							</Box>
						)
					)}
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
		</>
	);
};
