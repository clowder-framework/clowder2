import React, {ChangeEvent, useEffect, useState} from "react";
import {Box, Chip, Grid, Pagination, Table} from "@mui/material";

import {useDispatch, useSelector} from "react-redux";
import config from "../../app.config";
import {RootState} from "../../types/data";
import {fetchDatasets} from "../../actions/dataset";
import DatasetTableEntry from "../datasets/DatasetTableEntry";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {theme} from "../../theme";

type SelectedDataset = {
	id: string,
	label: string
};

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

	const [selectedDatasets, setSelectedDatasets] = useState<SelectedDataset[]>([]);
	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultDatasetPerPage);

	// Admin mode will fetch all projects
	useEffect(() => {
		listDatasets((currPageNum - 1) * limit, limit);
	}, [currPageNum, limit]);

	const selectDataset = (selectedDatasetId: string | undefined, selectedDatasetName: string | undefined) => {
		// add dataset to selection list
		if (selectedDatasetId && selectedDatasetName) {
			setSelectedDatasets([
				...selectedDatasets,
				{id: selectedDatasetId, label: selectedDatasetName}
			]);
		}
	};

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
					{
						selectedDatasets?.map((selected) => {
							return (
								<Chip label={selected.label} key={selected.id}/>
							);
						})
					}
				</Grid>
				<Grid container spacing={2}>
					{datasets !== undefined ? (<>
							<Table sx={{minWidth: 650}} aria-label="simple table">
								<TableHead>
									<TableRow>
										<TableCell>Name</TableCell>
										<TableCell align="right">Created</TableCell>
										<TableCell align="right">Size</TableCell>
										<TableCell align="right">Type</TableCell>
										<TableCell align="right"/>
									</TableRow>
								</TableHead>
								<TableBody>
									{
										datasets.map((dataset) => {
											return (
												<DatasetTableEntry
													iconStyle={{
														verticalAlign: "middle",
														color: theme.palette.primary.main,
													}}
													selectDataset={selectDataset}
													dataset={dataset}
												/>
											);
										})
									}
								</TableBody>
							</Table>
						</>
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
