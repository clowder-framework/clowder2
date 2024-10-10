import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { fetchListenerJobs } from "../../actions/listeners";
import { ExtractionJobs } from "./ExtractionJobs";
import { format } from "date-fns";
import { parseDate } from "../../utils/common";

const createData = (
	status: string,
	jobId: string,
	listener_id: string,
	created: string,
	creator: string,
	duration: number
) => {
	return {
		status,
		listener_id,
		jobId,
		created,
		creator,
		duration,
	};
};

const headCells = [
	{
		id: "status",
		label: "",
	},
	{
		id: "listener_id",
		label: "Extractor Name",
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
];
export const ExtractionHistoryTab = (props): JSX.Element => {
	const { datasetId, fileId } = props;

	const dispatch = useDispatch();
	const listListenerJobs = (
		listenerId: string | null,
		status: string | null,
		userId: string | null,
		fileId: string | null,
		datasetId: string | null,
		created: string | null,
		skip: number,
		limit: number
	) =>
		dispatch(
			fetchListenerJobs(
				listenerId,
				status,
				userId,
				fileId,
				datasetId,
				created,
				skip,
				limit
			)
		);

	const jobs = useSelector((state: RootState) => state.listener.jobs);

	const [executionJobsTableRow, setExecutionJobsTableRow] = useState([]);
	const [selectedStatus, setSelectedStatus] = useState(null);
	const [selectedCreatedTime, setSelectedCreatedTime] = useState(null);

	useEffect(() => {
		listListenerJobs(
			null,
			null,
			null,
			fileId ? fileId : null,
			datasetId ? datasetId : null,
			null,
			0,
			100
		);
	}, []);

	const handleRefresh = () => {
		listListenerJobs(
			null,
			selectedStatus,
			null,
			fileId ? fileId : null,
			datasetId ? datasetId : null,
			selectedCreatedTime ? format(selectedCreatedTime, "yyyy-MM-dd") : null,
			0,
			100
		);
	};

	useEffect(() => {
		// TODO add pagination for jobs
		handleRefresh();
	}, [selectedStatus, selectedCreatedTime]);

	useEffect(() => {
		const rows = [];
		if (jobs.length > 0) {
			jobs.map((job) => {
				rows.push(
					createData(
						job["status"],
						job["id"],
						job["listener_id"],
						parseDate(job["created"]),
						job["creator"]["email"],
						`${job["duration"]} sec`
					)
				);
			});
		}
		setExecutionJobsTableRow(rows);
	}, [jobs]);

	return (
		<ExtractionJobs
			rows={executionJobsTableRow}
			headCells={headCells}
			selectedStatus={selectedStatus}
			selectedCreatedTime={selectedCreatedTime}
			setSelectedStatus={setSelectedStatus}
			setSelectedCreatedTime={setSelectedCreatedTime}
			handleRefresh={handleRefresh}
			fileId={fileId}
			datasetId={datasetId}
		/>
	);
};
