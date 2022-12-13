import React, {useEffect, useState} from "react";
import {Box, Button, ButtonGroup, Grid, List, ListItem, Tab, Tabs, Typography} from "@mui/material";

import {Listener, RootState} from "../../types/data";
import {useDispatch, useSelector} from "react-redux";
import {fetchListeners} from "../../actions/listeners";
import {resetFailedReason} from "../../actions/common";

import {a11yProps, TabPanel} from "../tabs/TabComponent";
import {MainBreadcrumbs} from "../navigation/BreadCrumb";
import {ActionModal} from "../dialog/ActionModal";
import config from "../../app.config";
import {ArrowBack, ArrowForward} from "@material-ui/icons";
import Layout from "../Layout";
import {useSearchParams} from "react-router-dom";

const tab = {
	fontStyle: "normal",
	fontWeight: "normal",
	fontSize: "16px",
	textTransform: "capitalize",
};

export const Listeners = (): JSX.Element => {

	// parameters


	let [searchParams, setSearchParams] = useSearchParams();
	const fileId = searchParams.get("fileId");
	const datasetName = searchParams.get("datasetName");
	const fileName = searchParams.get("filename");
	const datasetId = searchParams.get("datasetId");


	if (datasetId !== null && datasetName !== null) {
		console.log("We have a dataset", datasetId, datasetName);
	}
	console.log("we log here", fileId, fileName);
	if (fileId !== null && fileName !== null) {
		console.log("We have a file", fileId, fileName);
	}


	// Redux connect equivalent
	const dispatch = useDispatch();
	const listListeners = (skip: number | undefined, limit: number | undefined) => dispatch(fetchListeners(skip, limit));

	const dismissError = () => dispatch(resetFailedReason());
	const listeners = useSelector((state: RootState) => state.listener.listeners);
	const reason = useSelector((state: RootState) => state.error.reason);
	const stack = useSelector((state: RootState) => state.error.stack);

	// TODO add option to determine limit number; default show 5 datasets each time
	const [currPageNum, setCurrPageNum] = useState<number>(0);
	const [limit,] = useState<number>(20);
	const [skip, setSkip] = useState<number | undefined>();
	// TODO add switch to turn on and off "mine" dataset
	const [mine,] = useState<boolean>(false);
	const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
	const [nextDisabled, setNextDisabled] = useState<boolean>(false);
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [selectedListener, _] = useState<Listener>();

	// component did mount
	useEffect(() => {
		listListeners(0, limit);
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

		// disable flipping if reaches the last page
		if (listeners.length < limit) setNextDisabled(true);
		else setNextDisabled(false);

	}, [listeners]);

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
		if (listeners.length === limit) {
			setSkip((currPageNum + 1) * limit);
			setCurrPageNum(currPageNum + 1);
		}
	};
	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			listListeners(skip, limit);
			if (skip === 0) setPrevDisabled(true);
			else setPrevDisabled(false);
		}
	}, [skip]);

	// for breadcrumb
	const paths = [
		{
			"name": "Listeners",
			"url": "/listeners",
		}
	];

	return (
		<Layout>
			<div className="outer-container">
				{/*Error Message dialogue*/}
				<ActionModal actionOpen={errorOpen} actionTitle="Something went wrong..." actionText={reason}
							 actionBtnName="Report" handleActionBtnClick={handleErrorReport}
							 handleActionCancel={handleErrorCancel}/>
				<Box m={1} display="flex" justifyContent="space-between" alignItems="flex-end">
					<MainBreadcrumbs paths={paths}/>
					{/*<Button href="/create-dataset" variant="contained" sx={{display: "flex", alignItems: "center"}}>New*/}
					{/*	Dataset</Button>*/}
				</Box>
				<div className="inner-container">
					<Grid container spacing={4}>
						<Grid item xs>
							<Box sx={{borderBottom: 1, borderColor: 'divider'}}>
								<Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="dashboard tabs">
									<Tab sx={tab} label="Listeners" {...a11yProps(0)} />
								</Tabs>
							</Box>
							<TabPanel value={selectedTabIndex} index={0}>
								<List>


									{
										listeners !== undefined ?
											listeners.map((listener) => {
												return (
													<ListItem>
														<Typography>
															{listener.name}
														</Typography>
														<Typography>
															{listener.description}
														</Typography>
													</ListItem>
												);
											})
											:
											<></>
									}
								</List>
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
							<TabPanel value={selectedTabIndex} index={1}/>
							<TabPanel value={selectedTabIndex} index={2}/>
							<TabPanel value={selectedTabIndex} index={3}/>
							<TabPanel value={selectedTabIndex} index={4}/>
						</Grid>
					</Grid>
				</div>
			</div>
		</Layout>
	)
}
