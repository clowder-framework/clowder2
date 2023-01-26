import React, {useEffect, useState} from "react";

import {Box, Button, ButtonGroup, Grid, List, ListItemButton, ListItemText, ListSubheader,} from "@mui/material";
import {useDispatch, useSelector,} from "react-redux";
import {Listener, RootState} from "../../types/data";

import {ActionModal} from "../dialog/ActionModal";
import config from "../../app.config";
import {resetFailedReason} from "../../actions/common";
import Layout from "../Layout";
import {fetchListenerJobs, fetchListeners} from "../../actions/listeners";
import {ArrowBack, ArrowForward} from "@material-ui/icons";
import {ListenerInfo} from "./ListenerInfo";
import {ExtractionJobs} from "./ExtractionJobs";
import {parseDate} from "../../utils/common";
import {ClowderTitle} from "../styledComponents/ClowderTitle";


const createData = (status: string, jobId: string, created: string, creator: string, duration: number, resourceId: string) => {
	return {
		status, jobId, created, creator, duration, resourceId
	};
}

const headCells = [
	{
		id: "status",
		label: "",
	},
	{
		id: "jobId",
		label: "Job ID",
	},
	{
		id: "created",
		label: "Submitted At",
	},
	{
		id: "creator",
		label: "Submitted By",
	},
	{
		id: "duration",
		label: "Duration",
	},
	{
		id: "resourceId",
		label: "Resource Id",
	},
];
export const ExtractionHistory = (): JSX.Element => {

	const dispatch = useDispatch();
	const listListeners = (skip: number | undefined, limit: number | undefined, selectedCategory: string | null,
						   selectedLabel: string | null) =>
		dispatch(fetchListeners(skip, limit, selectedCategory, selectedLabel));
	const listListenerJobs = (listenerId: string | null, status: string | null, userId: string | null, fileId: string | null,
							  datasetId: string | null, created: string | null, skip: number, limit: number) =>
		dispatch(fetchListenerJobs(listenerId, status, userId, fileId, datasetId, created, skip, limit))

	const listeners = useSelector((state: RootState) => state.listener.listeners);
	const jobs = useSelector((state: RootState) => state.listener.jobs);

	// Error msg dialog
	const reason = useSelector((state: RootState) => state.error.reason);
	const stack = useSelector((state: RootState) => state.error.stack);
	const dismissError = () => dispatch(resetFailedReason());
	const [errorOpen, setErrorOpen] = useState(false);
	const [currPageNum, setCurrPageNum] = useState<number>(0);
	const [limit,] = useState<number>(20);
	const [skip, setSkip] = useState<number | undefined>();
	const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
	const [nextDisabled, setNextDisabled] = useState<boolean>(false);
	const [selectedExtractor, setSelectedExtractor] = useState<Listener>();
	const [executionJobsTableRow, setExecutionJobsTableRow] = useState([]);

	useEffect(() => {
		listListeners(skip, limit, null, null);
		listListenerJobs(null, null, null, null, null, null,
			0, 100);
	}, []);


	useEffect(() => {
		// TODO add pagination for jobs
		if (selectedExtractor) {
			listListenerJobs(selectedExtractor["name"], null, null, null, null, null, 0, 100);
		}
	}, [selectedExtractor]);

	useEffect(() => {
		let rows = [];
		if (jobs.length > 0){
			jobs.map((job)=>{
				rows.push(createData(job["status"], job["id"], parseDate(job["created"]), job["creator"]["email"],
					job["duration"], job["resource_ref"]["resource_id"]));
			});
		}
		setExecutionJobsTableRow(rows);
	}, [jobs]);

	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			listListeners(skip, limit, null, null);
			if (skip === 0) setPrevDisabled(true);
			else setPrevDisabled(false);
		}
	}, [skip]);

	// fetch extractors from each individual dataset/id calls
	useEffect(() => {
		// disable flipping if reaches the last page
		if (listeners.length < limit) setNextDisabled(true);
		else setNextDisabled(false);
	}, [listeners]);

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
		if (reason !== "" && reason !== null && reason !== undefined) {
			setErrorOpen(true);
		}
	}, [reason]);

	const handleErrorCancel = () => {
		// reset error message and close the error window
		dismissError();
		setErrorOpen(false);
	}
	const handleErrorReport = () => {
		window.open(`${config.GHIssueBaseURL}+${reason}&body=${encodeURIComponent(stack)}`);
	}

	return (
		<Layout>
			<Box className="outer-container">
				{/*Error Message dialogue*/}
				<ActionModal actionOpen={errorOpen} actionTitle="Something went wrong..." actionText={reason}
							 actionBtnName="Report" handleActionBtnClick={handleErrorReport}
							 handleActionCancel={handleErrorCancel}/>
				{/*<Box className="inner-container">*/}
				<Grid container spacing={4}>
					<Grid item xs={12} sm={3} md={3} lg={3} xl={3}/>
					<Grid item xs={12} sm={9} md={9} lg={9} xl={9}>
						{/*Extractor infos when selected*/}
						{
							selectedExtractor ?
								<ListenerInfo selectedExtractor={selectedExtractor}/>

								:
								<ClowderTitle>All Extractions</ClowderTitle>

						}
					</Grid>
					<Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
						{/*Item list of listeners*/}
						<List
							sx={{width: '100%', bgcolor: 'background.paper'}}
							component="nav"
							aria-labelledby="list-extractions-subheader"
							subheader={
								<ListSubheader component="div" id="list-extractions-subheader">
									All Extractions
								</ListSubheader>
							}
						>
							{
								listeners !== undefined ?
									listeners.map((listener) => {
										return (
											<ListItemButton onClick={() => {
												setSelectedExtractor(listener);
											}}>
												<ListItemText primary={listener.name}/>
											</ListItemButton>
										);
									})
									:
									<></>
							}
							{/*pagination*/}
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
						</List>
					</Grid>
					<Grid item xs={12} sm={9} md={9} lg={9} xl={9}>
						{/*list of jobs*/}
						<ExtractionJobs rows={executionJobsTableRow} headCells={headCells}/>
					</Grid>
				</Grid>
			</Box>
			{/*</Box>*/}
		</Layout>
	);
}
