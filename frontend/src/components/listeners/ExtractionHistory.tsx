import React, { ChangeEvent, useEffect, useState } from "react";

import {
	Box,
	Grid,
	List,
	ListItemButton,
	ListItemText,
	ListSubheader,
	Pagination,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { EventListenerOut as Listener } from "../../openapi/v2";
import Layout from "../Layout";
import { fetchListenerJobs, fetchListeners } from "../../actions/listeners";
import { ListenerInfo } from "./ListenerInfo";
import { ExtractionJobs } from "./ExtractionJobs";
import { ClowderTitle } from "../styledComponents/ClowderTitle";
import { format } from "date-fns";
import { parseDate } from "../../utils/common";
import { ErrorModal } from "../errors/ErrorModal";

const createData = (
	status: string,
	jobId: string,
	created: string,
	creator: string,
	duration: number,
	resourceType: string,
	resourceId: string
) => {
	return {
		status,
		jobId,
		created,
		creator,
		duration,
		resourceType,
		resourceId,
	};
};

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
		id: "resourceType",
		label: "Resource Type",
	},
	{
		id: "resourceId",
		label: "Resource Id",
	},
];
export const ExtractionHistory = (): JSX.Element => {
	const dispatch = useDispatch();
	const listListeners = (
		skip: number | undefined,
		limit: number | undefined,
		heartbeatInterval: number | undefined,
		selectedCategory: string | null,
		selectedLabel: string | null,
		aliveOnly: boolean | undefined
	) =>
		dispatch(
			fetchListeners(
				skip,
				limit,
				heartbeatInterval,
				selectedCategory,
				selectedLabel,
				aliveOnly
			)
		);
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

	const listeners = useSelector(
		(state: RootState) => state.listener.listeners.data
	);
	const listenerPageMetadata = useSelector(
		(state: RootState) => state.listener.listeners.metadata
	);
	const jobs = useSelector((state: RootState) => state.listener.jobs.data);
	const jobPageMetadata = useSelector(
		(state: RootState) => state.listener.jobs.metadata
	);
	const adminMode = useSelector((state: RootState) => state.user.adminMode);

	const [errorOpen, setErrorOpen] = useState(false);
	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(20);
	const [selectedExtractor, setSelectedExtractor] = useState<Listener>();
	const [executionJobsTableRow, setExecutionJobsTableRow] = useState([]);
	const [selectedStatus, setSelectedStatus] = useState(null);
	const [selectedCreatedTime, setSelectedCreatedTime] = useState(null);
	const [aliveOnly, setAliveOnly] = useState<boolean>(false);

	useEffect(() => {
		listListeners(0, limit, 0, null, null, aliveOnly);
		listListenerJobs(null, null, null, null, null, null, 0, 100);
	}, []);

	useEffect(() => {
		listListeners((currPageNum - 1) * limit, limit, 0, null, null, aliveOnly);
		listListenerJobs(null, null, null, null, null, null, 0, 100);
	}, [adminMode]);

	useEffect(() => {
		if (selectedExtractor) {
			// TODO add pagination here
			listListenerJobs(
				selectedExtractor["name"],
				null,
				null,
				null,
				null,
				null,
				0,
				100
			);
			// clear filters
			setSelectedStatus(null);
			setSelectedCreatedTime(null);
		}
	}, [selectedExtractor]);

	const handleRefresh = () => {
		listListenerJobs(
			selectedExtractor ? selectedExtractor["name"] : null,
			selectedStatus,
			null,
			null,
			null,
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
		let rows = [];
		if (jobs.length > 0) {
			jobs.map((job) => {
				rows.push(
					createData(
						job["status"],
						job["id"],
						parseDate(job["created"]),
						job["creator"]["email"],
						`${job["duration"]} sec`,
						job["resource_ref"]["collection"],
						job["resource_ref"]["resource_id"]
					)
				);
			});
		}
		setExecutionJobsTableRow(rows);
	}, [jobs]);

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		listListeners(newSkip, limit, 0, null, null, aliveOnly);
	};

	return (
		<Layout>
			<Box className="outer-container">
				{/*Error Message dialogue*/}
				<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />

				{/*<Box className="inner-container">*/}
				<Grid container spacing={4}>
					<Grid item xs={12} sm={3} md={3} lg={3} xl={3} />
					<Grid item xs={12} sm={9} md={9} lg={9} xl={9}>
						{/*Extractor infos when selected*/}
						{selectedExtractor ? (
							<ListenerInfo selectedExtractor={selectedExtractor} />
						) : (
							<ClowderTitle>All Extractions</ClowderTitle>
						)}
					</Grid>
					<Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
						{/*Item list of listeners*/}
						<List
							sx={{ width: "100%", bgcolor: "background.paper" }}
							component="nav"
							aria-labelledby="list-extractions-subheader"
							subheader={
								<ListSubheader component="div" id="list-extractions-subheader">
									All Extractions
								</ListSubheader>
							}
						>
							{listeners !== undefined ? (
								listeners.map((listener) => {
									return (
										<ListItemButton
											onClick={() => {
												setSelectedExtractor(listener);
											}}
										>
											<ListItemText primary={listener.name} />
										</ListItemButton>
									);
								})
							) : (
								<></>
							)}
							{/*listner pagination*/}
							<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
								<Pagination
									count={Math.ceil(listenerPageMetadata.total_count / limit)}
									page={currPageNum}
									onChange={handlePageChange}
									shape="rounded"
									variant="outlined"
								/>
							</Box>
						</List>
					</Grid>
					<Grid item xs={12} sm={9} md={9} lg={9} xl={9}>
						{/*list of jobs*/}
						<ExtractionJobs
							rows={executionJobsTableRow}
							headCells={headCells}
							selectedStatus={selectedStatus}
							selectedCreatedTime={selectedCreatedTime}
							setSelectedStatus={setSelectedStatus}
							setSelectedCreatedTime={setSelectedCreatedTime}
							handleRefresh={handleRefresh}
						/>
					</Grid>
				</Grid>
			</Box>
			{/*</Box>*/}
		</Layout>
	);
};
