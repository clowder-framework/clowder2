import React, {ChangeEvent, useEffect, useState} from "react";
import {Box, Grid, Pagination} from "@mui/material";

import {useDispatch, useSelector} from "react-redux";
import config from "../../app.config";
import {RootState} from "../../types/data";
import {fetchDatasets} from "../../actions/dataset";
import DatasetCard from "../datasets/DatasetCard";

export const SelectDatasetsModal = (): JSX.Element => {
	// Redux connect equivalent
	const dispatch = useDispatch();
	const listDatasets = (skip: number | undefined, limit: number | undefined) =>
		dispatch(fetchDatasets(skip, limit));
	const datasets = useSelector(
		(state: RootState) => state.dataset.datasets.data
	);
	const pageMetadata = useSelector(
		(state: RootState) => state.dataset.datasets.metadata
	);

	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultDatasetPerPage);

	// Admin mode will fetch all projects
	useEffect(() => {
		listDatasets((currPageNum - 1) * limit, limit);
	}, [currPageNum, limit]);

	// pagination
	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		listDatasets(newSkip, limit);
	};

	return (
		<Grid container spacing={4}>
			<Grid item xs>
				<Grid container spacing={2}>
					{datasets !== undefined ? (
						datasets.map((dataset) => {
							return (
								<Grid item key={dataset.id} xs={12} sm={6} md={4} lg={3}>
									<DatasetCard
										id={dataset.id}
										name={dataset.name}
										author={`${dataset.creator.first_name} ${dataset.creator.last_name}`}
										created={dataset.created}
										description={dataset.description}
										thumbnailId={dataset.thumbnail_id}
										frozen={dataset.frozen}
										frozenVersionNum={dataset.frozen_version_num}
										download={false}
									/>
								</Grid>
							);
						})
					) : (
						<></>
					)}
				</Grid>
				{datasets !== undefined && pageMetadata.total_count !== undefined && datasets.length !== 0 ? (
					<Box display="flex" justifyContent="center" sx={{m: 1}}>
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
			</Grid>
		</Grid>
	);
};
