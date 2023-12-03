import React, { useEffect, useState } from "react";
import { Box, Button, ButtonGroup, Grid, Tab, Tabs } from "@mui/material";

import { RootState } from "../types/data";
import { useDispatch, useSelector } from "react-redux";
import {fetchPublicDatasets} from "../actions/public_dataset";

import { a11yProps, TabPanel } from "./tabs/TabComponent";
import DatasetCard from "./datasets/DatasetCard";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import PublicLayout from "./PublicLayout";
import Layout from "./Layout";

import { Link as RouterLink } from "react-router-dom";
import { Listeners } from "./listeners/Listeners";
import { ErrorModal } from "./errors/ErrorModal";
import {fetchDatasets} from "../actions/dataset";

const tab = {
	fontStyle: "normal",
	fontWeight: "normal",
	fontSize: "16px",
	textTransform: "capitalize",
};

export const Public = (): JSX.Element => {
	// Redux connect equivalent
	const dispatch = useDispatch();
	const [skip, setSkip] = useState<number | undefined>();

	const [limit] = useState<number>(21);
	// TODO add switch to turn on and off "mine" dataset
	const [mine] = useState<boolean>(false);
	const listPublicDatasets = (
		skip: number | undefined,
		limit: number | undefined
	) => dispatch(fetchPublicDatasets(skip, limit));

	const listDatasets = (
		skip: number | undefined,
		limit: number | undefined,
		mine: boolean | undefined
	) => dispatch(fetchDatasets(skip, limit, mine));
	const datasetState = useSelector((state: RootState) => state.dataset);
	const datasets = useSelector((state: RootState) => state.dataset.datasets);


	const currrentPublicDatasetState = useSelector((state: RootState) => state.publicDataset);
	const public_datasets = useSelector((state: RootState) => state.publicDataset.public_datasets);
	const [currPageNum, setCurrPageNum] = useState<number>(0);
	const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
	const [nextDisabled, setNextDisabled] = useState<boolean>(false);
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [errorOpen, setErrorOpen] = useState(false);


	useEffect(() => {
		listDatasets(0, limit, mine);
	}, []);

	useEffect( () => {
		listPublicDatasets(0, limit);
	}, []);

	// fetch thumbnails from each individual dataset/id calls
	useEffect(() => {
		// disable flipping if reaches the last page
		if (public_datasets.length < limit) setNextDisabled(true);
		else setNextDisabled(false);
	}, [public_datasets]);

	// switch tabs
	const handleTabChange = (
		_event: React.ChangeEvent<{}>,
		newTabIndex: number
	) => {
		setSelectedTabIndex(newTabIndex);
	};

		// for pagination keep flipping until the return dataset is less than the limit
	const previous = () => {
		if (currPageNum - 1 >= 0) {
			setSkip((currPageNum - 1) * limit);
			setCurrPageNum(currPageNum - 1);
		}
	};
	const next = () => {
		if (public_datasets.length === limit) {
			setSkip((currPageNum + 1) * limit);
			setCurrPageNum(currPageNum + 1);
		}
	};
	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			listPublicDatasets(skip, limit);
			if (skip === 0) setPrevDisabled(true);
			else setPrevDisabled(false);
		}
	}, [skip]);


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
							<Tab sx={tab} label="Extractors" {...a11yProps(1)} />
						</Tabs>
					</Box>
					<TabPanel value={selectedTabIndex} index={0}>
						<Grid container spacing={2}>
							{public_datasets !== undefined ?  (
								public_datasets.map((dataset) => {
									return (
										<Grid item key={dataset.id} xs={12} sm={6} md={4} lg={3}>
											<DatasetCard
												id={dataset.id}
												name={dataset.name}
												author={`${dataset.creator.first_name} ${dataset.creator.last_name}`}
												created={dataset.created}
												description={dataset.description}
												thumbnailId={dataset.thumbnail_id}
												publicView={true}
											/>
										</Grid>
									);
								})
							) : (
								<></>
							)}
						</Grid>
						{datasets.length !== 0 ? (
							<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
								<ButtonGroup
									variant="contained"
									aria-label="previous next buttons"
								>
									<Button
										aria-label="previous"
										onClick={previous}
										disabled={prevDisabled}
									>
										<ArrowBack /> Prev
									</Button>
									<Button
										aria-label="next"
										onClick={next}
										disabled={nextDisabled}
									>
										Next <ArrowForward />
									</Button>
								</ButtonGroup>
							</Box>
						): (
							<></>
						)}
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={1}>
						<Listeners />
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={4} />
					<TabPanel value={selectedTabIndex} index={2} />
					<TabPanel value={selectedTabIndex} index={3} />
				</Grid>
			</Grid>
		</PublicLayout>
	);
};
