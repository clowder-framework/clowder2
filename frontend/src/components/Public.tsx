import React, { ChangeEvent, useEffect, useState } from "react";
import { Box, Button, Grid, Link, Pagination, Tab, Tabs } from "@mui/material";

import { RootState } from "../types/data";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicDatasets } from "../actions/public_dataset";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { a11yProps, TabPanel } from "./tabs/TabComponent";
import PublicDatasetCard from "./datasets/PublicDatasetCard";
import PublicLayout from "./PublicLayout";
import { ErrorModal } from "./errors/ErrorModal";
import config from "../app.config";

const tab = {
	fontStyle: "normal",
	fontWeight: "normal",
	fontSize: "16px",
	textTransform: "capitalize",
};

const link = {
	fontSize: "12px",
	color: "#495057",
	m: 4,
};

export const Public = (): JSX.Element => {
	// Redux connect equivalent
	const dispatch = useDispatch();

	const listPublicDatasets = (
		skip: number | undefined,
		limit: number | undefined
	) => dispatch(fetchPublicDatasets(skip, limit));

	const pageMetadata = useSelector(
		(state: RootState) => state.publicDataset.publicDatasets.metadata
	);
	const publicDatasets = useSelector(
		(state: RootState) => state.publicDataset.publicDatasets.data
	);

	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultDatasetPerPage);
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [errorOpen, setErrorOpen] = useState(false);

	useEffect(() => {
		listPublicDatasets((currPageNum - 1) * limit, limit);
	}, []);

	// switch tabs
	const handleTabChange = (
		_event: React.ChangeEvent<{}>,
		newTabIndex: number
	) => {
		setSelectedTabIndex(newTabIndex);
	};

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		listPublicDatasets(newSkip, limit);
	};

	return (
		<PublicLayout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />

			<Grid container spacing={4}>
				<Grid item xs>
					<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
						<Tabs
							value={selectedTabIndex}
							onChange={handleTabChange}
							aria-label="dashboard tabs"
						>
							<Tab sx={tab} label="Datasets" {...a11yProps(0)} />
						</Tabs>
					</Box>
					<TabPanel value={selectedTabIndex} index={0}>
						<Grid container spacing={2}>
							{publicDatasets !== undefined && publicDatasets.length > 0 ? (
								publicDatasets.map((dataset) => {
									return (
										<Grid item key={dataset.id} xs={12} sm={6} md={4} lg={3}>
											<PublicDatasetCard
												id={dataset.id}
												name={dataset.name}
												author={`${dataset.creator.first_name} ${dataset.creator.last_name}`}
												created={dataset.created}
												description={dataset.description}
												thumbnailId={dataset.thumbnail_id}
												publicView={true}
												frozen={dataset.frozen}
												frozenVersionNum={dataset.frozen_version_num}
												status={dataset.status}
											/>
										</Grid>
									);
								})
							) : (
								<Box>
									<p>
										No public datasets available.{" "}
										<Link component={RouterLink} to="/auth/login">
											Login
										</Link>{" "}
										or{" "}
										<Link component={RouterLink} to="/auth/register">
											register
										</Link>{" "}
										to create datasets.{" "}
									</p>
								</Box>
							)}
						</Grid>
						<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
							<Pagination
								count={Math.ceil(pageMetadata.total_count / limit)}
								page={currPageNum}
								onChange={handlePageChange}
								shape="rounded"
								variant="outlined"
							/>
						</Box>
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={4} />
					<TabPanel value={selectedTabIndex} index={2} />
					<TabPanel value={selectedTabIndex} index={3} />
				</Grid>
			</Grid>
		</PublicLayout>
	);
};
