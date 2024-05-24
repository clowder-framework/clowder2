import { Box, Link, Pagination, Typography } from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPublicFreezeDatasets as getPublicFreezeDatasetsAction } from "../../../actions/public_dataset";
import { RootState } from "../../../types/data";
import config from "../../../app.config";
import { theme } from "../../../theme";
import { parseDate } from "../../../utils/common";
import Divider from "@mui/material/Divider";

export const PublicDatasetVersions = (props) => {
	// search parameters
	const [searchParams] = useSearchParams();
	const currVersionPageNumParam = searchParams.get("currVersionPageNum");

	const { currDataset } = props;

	const [currVersionPageNum, setCurrVersionPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultVersionPerPage);
	const [skip, setSkip] = useState<number>(0);

	const dispatch = useDispatch();
	const getPublicFreezeDatasets = (
		datasetId: string | undefined,
		skip: number,
		limit: number
	) => dispatch(getPublicFreezeDatasetsAction(datasetId, skip, limit));

	const frozenDatasets = useSelector(
		(state: RootState) => state.publicDataset.publicFrozenDatasets.data
	);
	const pageMetadata = useSelector(
		(state: RootState) => state.publicDataset.publicFrozenDatasets.metadata
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
		if (datasetId) getPublicFreezeDatasets(datasetId, skip, limit);
	}, [currDataset, skip, limit]);

	const handleVersionChange = (selectedDatasetId: string) => {
		// current version flip to page 1
		if (selectedDatasetId === currDataset.origin_id) {
			history(`/public/datasets/${selectedDatasetId}?currVersionPageNum=1`);
			// other version flip to the current page
		} else {
			history(
				`/public/datasets/${selectedDatasetId}?currVersionPageNum=${currVersionPageNum}`
			);
		}
	};

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const originDatasetId = currDataset.origin_id;
		const newSkip = (value - 1) * limit;
		setCurrVersionPageNum(value);
		setSkip(newSkip);
		getPublicFreezeDatasets(originDatasetId, newSkip, limit);
	};

	return (
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
						sx={{
							color: theme.palette.primary.main,
							pointerEvents:
								currDataset.id === currDataset.origin_id ? "none" : "auto",
							textDecoration: "none",
							fontWeight:
								currDataset.id === currDataset.origin_id ? "bold" : "normal",
							"&:hover": {
								textDecoration: "underline",
							},
						}}
					>
						Current
					</Link>
					<Box>
						<Typography
							variant="caption"
							sx={{
								color: "text.primary.light",
								fontWeight:
									currDataset.id === currDataset.origin_id ? "bold" : "normal",
							}}
						>
							{parseDate(currDataset.modified)}
						</Typography>
					</Box>
					<Divider orientation="horizontal" />
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
									{parseDate(dataset.modified)}
								</Typography>
							</Box>
							<Divider orientation="horizontal" />
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
									sx={{
										color: theme.palette.primary.main,
										pointerEvents:
											currDataset.id === dataset.id ? "none" : "auto",
										textDecoration: "none",
										fontWeight:
											currDataset.id === dataset.id ? "bold" : "normal",
										"&:hover": {
											textDecoration: "underline",
										},
									}}
								>
									Version {dataset.frozen_version_num}
								</Link>
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
									{parseDate(dataset.modified)}
								</Typography>
							</Box>
							<Divider orientation="horizontal" />
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
	);
};
