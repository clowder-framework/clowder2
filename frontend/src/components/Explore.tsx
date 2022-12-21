import React, {useEffect, useState} from "react";
import {Box, Button, ButtonGroup, Grid, Tab, Tabs} from "@mui/material";

import {Dataset, RootState} from "../types/data";
import {useDispatch, useSelector} from "react-redux";
import {fetchDatasets} from "../actions/dataset";
import {resetFailedReason} from "../actions/common";
import {downloadThumbnail} from "../utils/thumbnail";

import {a11yProps, TabPanel} from "./tabs/TabComponent";
import {ActionModal} from "./dialog/ActionModal";
import DatasetCard from "./datasets/DatasetCard";
import config from "../app.config";
import {ArrowBack, ArrowForward} from "@material-ui/icons";
import Layout from "./Layout";
import {Listeners} from "./listeners/Listeners";

const tab = {
	fontStyle: "normal",
	fontWeight: "normal",
	fontSize: "16px",
	textTransform: "capitalize",
};

export const Explore = (): JSX.Element => {


	// Redux connect equivalent
	const dispatch = useDispatch();
	const listDatasets = (skip: number | undefined, limit: number | undefined, mine: boolean | undefined) => dispatch(fetchDatasets(skip, limit, mine));
	const dismissError = () => dispatch(resetFailedReason());
	const datasets = useSelector((state: RootState) => state.dataset.datasets);
	const reason = useSelector((state: RootState) => state.error.reason);
	const stack = useSelector((state: RootState) => state.error.stack);

	const [datasetThumbnailList, setDatasetThumbnailList] = useState<any>([]);
	// TODO add option to determine limit number; default show 5 datasets each time
	const [currPageNum, setCurrPageNum] = useState<number>(0);
	const [limit,] = useState<number>(20);
	const [skip, setSkip] = useState<number | undefined>();
	// TODO add switch to turn on and off "mine" dataset
	const [mine,] = useState<boolean>(false);
	const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
	const [nextDisabled, setNextDisabled] = useState<boolean>(false);
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [selectedDataset, _] = useState<Dataset>();

	// component did mount
	useEffect(() => {
		listDatasets(0, limit, mine);
	}, []);

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);
	useEffect(() => {
		if (reason !== "" && reason !== null && reason !== undefined) {
			setErrorOpen(true);
		}
	}, [reason])
	const handleErrorCancel = () => {
		// reset error message and close the error window
		dismissError();
		setErrorOpen(false);
	}
	const handleErrorReport = () => {
		window.open(`${config.GHIssueBaseURL}+${reason}&body=${encodeURIComponent(stack)}`);
	}

	// fetch thumbnails from each individual dataset/id calls
	useEffect(() => {
		(async () => {
			if (datasets !== undefined && datasets.length > 0) {

				// TODO change the type any to something else
				const datasetThumbnailListTemp: any = [];
				await Promise.all(datasets.map(async (dataset) => {
					// add thumbnails
					if (dataset["thumbnail"] !== null && dataset["thumbnail"] !== undefined) {
						const thumbnailURL = await downloadThumbnail(dataset["thumbnail"]);
						datasetThumbnailListTemp.push({"id": dataset["id"], "thumbnail": thumbnailURL});
					}
				}));
				setDatasetThumbnailList(datasetThumbnailListTemp);
			}
		})();

		// disable flipping if reaches the last page
		if (datasets.length < limit) setNextDisabled(true);
		else setNextDisabled(false);

	}, [datasets]);

	// switch tabs
	const handleTabChange = (_event: React.ChangeEvent<{}>, newTabIndex: number) => {
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
		if (datasets.length === limit) {
			setSkip((currPageNum + 1) * limit);
			setCurrPageNum(currPageNum + 1);
		}
	};
	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			listDatasets(skip, limit, mine);
			if (skip === 0) setPrevDisabled(true);
			else setPrevDisabled(false);
		}
	}, [skip]);

	return (
		<Layout>
			<div className="outer-container">
				{/*Error Message dialogue*/}
				<ActionModal actionOpen={errorOpen} actionTitle="Something went wrong..." actionText={reason}
							 actionBtnName="Report" handleActionBtnClick={handleErrorReport}
							 handleActionCancel={handleErrorCancel}/>
				<div className="inner-container">
					<Grid container spacing={4}>
						<Grid item xs>
							<Box sx={{borderBottom: 1, borderColor: 'divider'}}>
								<Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="dashboard tabs">
									<Tab sx={tab} label="Datasets" {...a11yProps(0)} />
									<Tab sx={tab} label="Extractors" {...a11yProps(1)} />
								</Tabs>
							</Box>
							<TabPanel value={selectedTabIndex} index={0}>
								<Grid container spacing={2}>
									{
										datasets !== undefined && datasetThumbnailList !== undefined ?
											datasets.map((dataset) => {
												return (
													<Grid item key={dataset.id} xs={12} sm={6} md={4} lg={3}>
														<DatasetCard id={dataset.id} name={dataset.name}
																	 author={`${dataset.author.first_name} ${dataset.author.last_name}`}
																	 created={dataset.created}
																	 description={dataset.description}/>
													</Grid>
												);
											})
											:
											<></>
									}
								</Grid>
								<Box display="flex" justifyContent="center" sx={{m: 1}}>
									<ButtonGroup variant="contained" aria-label="previous next buttons">
										<Button aria-label="previous" onClick={previous} disabled={prevDisabled}>
											<ArrowBack/> Prev
										</Button>
										<Button aria-label="next" onClick={next} disabled={nextDisabled}>
											Next <ArrowForward/>
										</Button>
									</ButtonGroup>
								</Box>
							</TabPanel>
							<TabPanel value={selectedTabIndex} index={1}>
								<Listeners/>
							</TabPanel>
							<TabPanel value={selectedTabIndex} index={4}/>
							<TabPanel value={selectedTabIndex} index={2}/>
							<TabPanel value={selectedTabIndex} index={3}/>


						</Grid>
					</Grid>
				</div>
			</div>
		</Layout>
	)
}
