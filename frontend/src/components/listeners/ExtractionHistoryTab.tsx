import React, {useEffect, useState} from "react";

import {Box,} from "@mui/material";
import {useDispatch, useSelector,} from "react-redux";
import {RootState} from "../../types/data";

import {ActionModal} from "../dialog/ActionModal";
import config from "../../app.config";
import {resetFailedReason} from "../../actions/common";
import Layout from "../Layout";
import {fetchListenerJobs} from "../../actions/listeners";
import {ExtractionJobs} from "./ExtractionJobs";
import {format} from "date-fns";
import {parseDate} from "../../utils/common";


const createData = (status: string, jobId: string, created: string, creator: string, duration: number, resourceType: string, resourceId: string) => {
	return {
		status, jobId, created, creator, duration, resourceType, resourceId
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
export const ExtractionHistoryTab = (props): JSX.Element => {
	const {datasetId, fileId} = props;

	const dispatch = useDispatch();
	const listListenerJobs = (listenerId: string | null, status: string | null, userId: string | null, fileId: string | null,
							  datasetId: string | null, created: string | null, skip: number, limit: number) =>
		dispatch(fetchListenerJobs(listenerId, status, userId, fileId, datasetId, created, skip, limit))

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
	const [executionJobsTableRow, setExecutionJobsTableRow] = useState([]);
	const [selectedStatus, setSelectedStatus] = useState(null);
	const [selectedCreatedTime, setSelectedCreatedTime] = useState(null);


	useEffect(() => {
		listListenerJobs(null, null, null, fileId ? fileId : null,
			datasetId ? datasetId : null, null, 0, 100);
	}, []);

	const handleRefresh = () => {
		listListenerJobs(null, selectedStatus, null, fileId ? fileId : null,
			datasetId ? datasetId : null,
			selectedCreatedTime ? format(selectedCreatedTime, "yyyy-MM-dd") : null, 0, 100);
	}

	useEffect(() => {
		// TODO add pagination for jobs
		handleRefresh();
	}, [selectedStatus, selectedCreatedTime]);

	useEffect(() => {
		let rows = [];
		if (jobs.length > 0) {
			jobs.map((job) => {
				rows.push(createData(job["status"], job["id"], parseDate(job["created"]), job["creator"]["email"], job["duration"], job["resource_ref"]["collection"], job["resource_ref"]["resource_id"]));
			});
		}
		setExecutionJobsTableRow(rows);
	}, [jobs]);

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
				{/*list of jobs*/}
				<ExtractionJobs rows={executionJobsTableRow} headCells={headCells}
								selectedStatus={selectedStatus}
								selectedCreatedTime={selectedCreatedTime}
								setSelectedStatus={setSelectedStatus}
								setSelectedCreatedTime={setSelectedCreatedTime}
								handleRefresh={handleRefresh}
				/>
			</Box>
		</Layout>
	);
}
