import * as React from "react";
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

export interface Data {
	status: string;
	jobId: string;
	created: string;
	creator: string;
	duration: number;
	resourceId: string;
	resourceType: string;
}

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
		rows,
		headCells,
		selectedStatus,
		selectedCreatedTime,
		setSelectedStatus,
		setSelectedCreatedTime,
		handleRefresh,
	} = props;

	const [order, setOrder] = React.useState<Order>("desc");
	const [orderBy, setOrderBy] = React.useState<keyof Data>("created");
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);
	const [openExtractorPane, setOpenExtractorPane] = React.useState(false);
	const [jobId, setJobId] = React.useState("");

	const handleRequestSort = (
		event: React.MouseEvent<unknown>,
		property: keyof Data
	) => {
		const isAsc = orderBy === property && order === "asc";
		setOrder(isAsc ? "desc" : "asc");
		setOrderBy(property);
	};

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleExtractionSummary = () => {
		setOpenExtractorPane(true);
	};

	const handleSubmitExtractionClose = () => {
		setOpenExtractorPane(false);
	};

	// Avoid a layout jump when reaching the last page with empty rows.
	const emptyRows =
		page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

	return (
		<Box sx={{ width: "100%" }}>
			<Paper sx={{ width: "100%", mb: 2 }}>
				<Dialog
					open={openExtractorPane}
					onClose={handleSubmitExtractionClose}
					fullWidth={true}
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
						numExecution={rows.length}
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
							{stableSort(rows, getComparator(order, orderBy))
								.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
								.map((row) => {
									return (
										<TableRow key={row.jobId}>
											<TableCell
												align="right"
												sx={{ color: theme.palette.primary.main }}
											>
												{row.status ===
												config.eventListenerJobStatus.created ? (
													<AddCircleOutlineIcon />
												) : null}
												{row.status ===
												config.eventListenerJobStatus.resubmitted ? (
													<RestartAltIcon />
												) : null}
												{row.status ===
												config.eventListenerJobStatus.started ? (
													<PlayCircleOutlineIcon />
												) : null}
												{row.status ===
												config.eventListenerJobStatus.processing ? (
													<AccessTimeIcon />
												) : null}
												{row.status ===
												config.eventListenerJobStatus.succeeded ? (
													<CheckCircleIcon />
												) : null}
												{row.status === config.eventListenerJobStatus.error ? (
													<CancelIcon />
												) : null}
												{row.status ===
												config.eventListenerJobStatus.skipped ? (
													<SkipNextIcon />
												) : null}
											</TableCell>
											{Object.keys(row).map((key) => {
												if (key == "jobId") {
													return (
														<TableCell align="left">
															<Link
																component="button"
																variant="body2"
																onClick={() => {
																	setJobId(row[key]);
																	handleExtractionSummary();
																}}
															>
																{row[key]}
															</Link>
														</TableCell>
													);
												}
												if (key !== "status")
													return <TableCell align="left">{row[key]}</TableCell>;
											})}
										</TableRow>
									);
								})}
							{emptyRows > 0 && (
								<TableRow
									style={{
										height: 53 * emptyRows,
									}}
								>
									<TableCell colSpan={6} />
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={rows.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</Paper>
		</Box>
	);
};
