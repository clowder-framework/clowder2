import React, {ChangeEvent, useEffect, useState} from "react";
import {Box, Button, Grid, Pagination, Tab, Tabs} from "@mui/material";

import {RootState} from "../types/data";
import {useDispatch, useSelector} from "react-redux";
import {fetchDatasets} from "../actions/dataset";

import {a11yProps, TabPanel} from "./tabs/TabComponent";
import DatasetCard from "./datasets/DatasetCard";
import Layout from "./Layout";
import {Link as RouterLink} from "react-router-dom";
import {ErrorModal} from "./errors/ErrorModal";
import {DatasetOut} from "../openapi/v2";
import config from "../app.config";

const tab = {
	fontStyle: "normal",
	fontWeight: "normal",
	fontSize: "16px",
	textTransform: "capitalize",
};

export const Explore = (): JSX.Element => {
	// Redux connect equivalent
	const dispatch = useDispatch();
	const listDatasets = (
		skip: number | undefined,
		limit: number | undefined,
		mine: boolean | undefined
	) => dispatch(fetchDatasets(skip, limit, mine));
	const datasets = useSelector(
		(state: RootState) => state.dataset.datasets.data
	);
	const deletedDataset = useSelector(
		(state: RootState) => state.dataset.deletedDataset
	);
	const pageMetadata = useSelector(
		(state: RootState) => state.dataset.datasets.metadata
	);
	const adminMode = useSelector((state: RootState) => state.user.adminMode);

	// TODO add option to determine limit number; default show 12 datasets each time
	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultDatasetPerPage);
	// TODO add switch to turn on and off "mine" dataset
	const [mine, setMine] = useState<boolean>(false);
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [errorOpen, setErrorOpen] = useState(false);

	// Admin mode will fetch all datasets
	useEffect(() => {
		if (adminMode) {
			if (selectedTabIndex === 1) {
				listDatasets((currPageNum - 1) * limit, limit, true);
			} else {
				listDatasets((currPageNum - 1) * limit, limit, false);
			}
		} else listDatasets((currPageNum - 1) * limit, limit, mine);
	}, [adminMode, deletedDataset, mine, currPageNum, selectedTabIndex, limit]);

	// switch tabs
	const handleTabChange = (
		_event: React.ChangeEvent<{}>,
		newTabIndex: number
	) => {
		if (newTabIndex === 1) {
			setMine(true);
			setCurrPageNum(1);
		} else {
			setMine(false);
			setCurrPageNum(1);
		}
		setSelectedTabIndex(newTabIndex);
	};

	// pagination
	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		listDatasets(newSkip, limit, mine);
	};

	return (
		<Layout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen}/>
			<Grid container spacing={4}>
				<Grid item xs>
					<Box sx={{borderBottom: 1, borderColor: "divider"}}>
						<Tabs
							value={selectedTabIndex}
							onChange={handleTabChange}
							aria-label="dashboard tabs"
						>
							<Tab sx={tab} label="Datasets" {...a11yProps(0)} />
							<Tab sx={tab} label="My Datasets" {...a11yProps(1)} />
						</Tabs>
					</Box>
					<TabPanel value={selectedTabIndex} index={0}>
						<Grid container spacing={2}>
							{datasets !== undefined ? (
								datasets.map((dataset: DatasetOut) => {
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
												download={true}
											/>
										</Grid>
									);
								})
							) : (
								<></>
							)}
							{datasets.length === 0 ? (
								<Grid container justifyContent="center">
									<Box textAlign="center">
										<p>
											Nobody has created any datasets on this instance. Click
											below to create a dataset!
										</p>
										<Button
											component={RouterLink}
											to="/create-dataset"
											variant="contained"
											sx={{m: 2}}
										>
											Create Dataset
										</Button>
									</Box>
								</Grid>
							) : (
								<></>
							)}
						</Grid>
						{datasets.length !== 0 ? (
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
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={1}>
						<Grid container spacing={2}>
							{datasets !== undefined ? (
								datasets.map((dataset: DatasetOut) => {
									return (
										<Grid item key={dataset.id} xs={12} sm={6} md={4} lg={3}>
											<DatasetCard
												id={dataset.id}
												name={dataset.name}
												author={`${dataset.creator.first_name} ${dataset.creator.last_name}`}
												created={dataset.created}
												description={dataset.description}
												thumbnailId={dataset.thumbnail_id}
												download={true}
											/>
										</Grid>
									);
								})
							) : (
								<></>
							)}
							{datasets.length === 0 ? (
								<Grid container justifyContent="center">
									<Box textAlign="center">
										<p>
											Nobody has created any datasets on this instance. Click
											below to create a dataset!
										</p>
										<Button
											component={RouterLink}
											to="/create-dataset"
											variant="contained"
											sx={{m: 2}}
										>
											Create Dataset
										</Button>
									</Box>
								</Grid>
							) : (
								<></>
							)}
						</Grid>
						{datasets.length !== 0 ? (
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
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={4}/>
					<TabPanel value={selectedTabIndex} index={2}/>
					<TabPanel value={selectedTabIndex} index={3}/>
				</Grid>
			</Grid>
		</Layout>
	);
};
