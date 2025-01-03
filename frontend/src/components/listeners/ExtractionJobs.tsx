import * as React from "react";
import { ChangeEvent, useEffect } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Link,
} from "@mui/material";
import { theme } from "../../theme";
import { ExtractionJobsToolbar } from "./ExtractionJobsToolbar";
import { EnhancedTableHead as ExtractionJobsTableHeader } from "./ExtractionJobsTableHeader";
import ExtractorStatus from "./ExtractorStatus";
import config from "../../app.config";
import { fetchListenerJobs } from "../../actions/listeners";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { format } from "date-fns";
import { parseDate } from "../../utils/common";

export interface Data {
	status: string;
	jobId: string;
	listenerName: string;
	created: string;
	creator: string;
	duration: number;
	resourceId: string;
	resourceType: string;
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
		id: "extractorName",
		label: "Extractor Name",
	},
	{
		id: "created",
		label: "Submitted On",
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

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

export type Order = "asc" | "desc";

function getComparator<Key extends keyof any>(
	order: Order,
	orderBy: Key
): (
	a: { [key in Key]: number | string },
	b: { [key in Key]: number | string }
) => number {
	return order === "desc"
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don"t
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort<T>(
	array: readonly T[],
	comparator: (a: T, b: T) => number
) {
	const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0]);
		if (order !== 0) {
			return order;
		}
		return a[1] - b[1];
	});
	return stabilizedThis.map((el) => el[0]);
}

export const ExtractionJobs = (props) => {
	const {
		selectedStatus,
		selectedCreatedTime,
		setSelectedStatus,
		setSelectedCreatedTime,
		selectedExtractor,
		fileId,
		datasetId,
	} = props;

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

	const jobs = useSelector((state: RootState) => state.listener.jobs.data);
	const jobPageMetadata = useSelector(
		(state: RootState) => state.listener.jobs.metadata
	);
	const adminMode = useSelector((state: RootState) => state.user.adminMode);

	const [order, setOrder] = React.useState<Order>("desc");
	const [orderBy, setOrderBy] = React.useState<keyof Data>("created");
	const [currPageNum, setCurrPageNum] = React.useState(1);
	const [limit, setLimit] = React.useState(config.defaultExtractionJobs);
	const [openExtractorPane, setOpenExtractorPane] = React.useState(false);
	const [jobId, setJobId] = React.useState("");

	useEffect(() => {
		setCurrPageNum(1);
		listListenerJobs(
			selectedExtractor ? selectedExtractor["name"] : null,
			selectedStatus,
			null,
			fileId ? fileId : null,
			datasetId ? datasetId : null,
			selectedCreatedTime ? format(selectedCreatedTime, "yyyy-MM-dd") : null,
			0,
			limit
		);
	}, [
		adminMode,
		selectedExtractor,
		selectedStatus,
		selectedCreatedTime,
		limit,
		dispatch,
	]);

	const handleRefresh = () => {
		listListenerJobs(
			selectedExtractor ? selectedExtractor["name"] : null,
			selectedStatus,
			null,
			fileId ? fileId : null,
			datasetId ? datasetId : null,
			selectedCreatedTime ? format(selectedCreatedTime, "yyyy-MM-dd") : null,
			(currPageNum - 1) * limit,
			limit
		);
	};

	const handleRequestSort = (
		_: React.MouseEvent<unknown>,
		property: keyof Data
	) => {
		const isAsc = orderBy === property && order === "asc";
		setOrder(isAsc ? "desc" : "asc");
		setOrderBy(property);
	};

	const handleChangePage = (_: ChangeEvent<unknown>, newPage: number) => {
		const newSkip = newPage * limit;
		setCurrPageNum(newPage + 1);
		listListenerJobs(
			selectedExtractor ? selectedExtractor["name"] : null,
			selectedStatus ? selectedStatus : null,
			null,
			fileId ? fileId : null,
			datasetId ? datasetId : null,
			selectedCreatedTime ? format(selectedCreatedTime, "yyyy-MM-dd") : null,
			newSkip,
			limit
		);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const newRowsPerPage = parseInt(event.target.value, 10);
		setLimit(parseInt(event.target.value, 10));

		// reset to first page
		setCurrPageNum(1);
		listListenerJobs(
			selectedExtractor ? selectedExtractor["name"] : null,
			selectedStatus ? selectedStatus : null,
			null,
			fileId ? fileId : null,
			datasetId ? datasetId : null,
			selectedCreatedTime ? format(selectedCreatedTime, "yyyy-MM-dd") : null,
			0,
			newRowsPerPage
		);
	};

	const handleExtractionSummary = () => {
		setOpenExtractorPane(true);
	};

	const handleSubmitExtractionClose = () => {
		setOpenExtractorPane(false);
	};

	return (
		<Box sx={{ width: "100%" }}>
			<Paper sx={{ width: "100%", mb: 2 }}>
				<Dialog
					open={openExtractorPane}
					onClose={handleSubmitExtractionClose}
					fullWidth={true}
					maxWidth="md"
				>
					<DialogTitle>Extractor Logs</DialogTitle>
					<DialogContent>
						<ExtractorStatus job_id={jobId} />
					</DialogContent>
					<DialogActions>
						<Button onClick={handleSubmitExtractionClose}>Close</Button>
					</DialogActions>
				</Dialog>
				<TableContainer>
					<ExtractionJobsToolbar
						numExecution={jobs.length}
						selectedStatus={selectedStatus}
						selectedCreatedTime={selectedCreatedTime}
						setSelectedStatus={setSelectedStatus}
						setSelectedCreatedTime={setSelectedCreatedTime}
						handleRefresh={handleRefresh}
					/>
					<Table
						sx={{ minWidth: 750 }}
						aria-labelledby="tableTitle"
						size={"medium"}
					>
						<ExtractionJobsTableHeader
							order={order}
							orderBy={orderBy}
							onRequestSort={handleRequestSort}
							headCells={headCells}
						/>
						<TableBody>
							{stableSort(jobs, getComparator(order, orderBy)).map((job) => {
								return (
									<TableRow key={job.id}>
										<TableCell
											align="right"
											sx={{ color: theme.palette.primary.main }}
										>
											{job.status === config.eventListenerJobStatus.created ? (
												<AddCircleOutlineIcon />
											) : null}
											{job.status ===
											config.eventListenerJobStatus.resubmitted ? (
												<RestartAltIcon />
											) : null}
											{job.status === config.eventListenerJobStatus.started ? (
												<PlayCircleOutlineIcon />
											) : null}
											{job.status ===
											config.eventListenerJobStatus.processing ? (
												<AccessTimeIcon />
											) : null}
											{job.status ===
											config.eventListenerJobStatus.succeeded ? (
												<CheckCircleIcon />
											) : null}
											{job.status === config.eventListenerJobStatus.error ? (
												<CancelIcon />
											) : null}
											{job.status === config.eventListenerJobStatus.skipped ? (
												<SkipNextIcon />
											) : null}
										</TableCell>
										<TableCell align="left">
											<Link
												component="button"
												variant="body2"
												onClick={() => {
													setJobId(job.id);
													handleExtractionSummary();
												}}
											>
												{job.id}
											</Link>
										</TableCell>
										<TableCell align="left">{job.listener_id}</TableCell>
										<TableCell align="left">{parseDate(job.created)}</TableCell>
										<TableCell align="left">{job.creator.email}</TableCell>
										<TableCell align="left">{job.duration} seconds</TableCell>
										<TableCell align="left">
											{job.resource_ref.collection}
										</TableCell>
										<TableCell align="left">
											{job.resource_ref.resource_id}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					rowsPerPageOptions={[5, 10, 20]}
					component="div"
					count={jobPageMetadata.total_count ? jobPageMetadata.total_count : 0}
					rowsPerPage={limit}
					page={currPageNum - 1}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</Paper>
		</Box>
	);
};
