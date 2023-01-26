import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Paper from "@mui/material/Paper";
import {visuallyHidden} from "@mui/utils";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import {theme} from "../../theme";
import {FormControl, InputLabel, MenuItem, Select, Typography} from "@mui/material";
import {useState} from "react";
import {DateRange} from "@appbaseio/reactivesearch";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";
import {ClowderMetadataTextField} from "../styledComponents/ClowderMetadataTextField";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {ClowderFootnote} from "../styledComponents/ClowderFootnote";

interface Data {
	status: string;
	jobId: string;
	created: string;
	creator: string;
	duration: number;
	fileId: string;
	datasetId: string;
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

type Order = "asc" | "desc";

function getComparator<Key extends keyof any>(
	order: Order,
	orderBy: Key,
): (
	a: { [key in Key]: number | string },
	b: { [key in Key]: number | string },
) => number {
	return order === "desc"
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don"t
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
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

interface EnhancedTableProps {
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
	order: Order;
	orderBy: string;
	headCells: any;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const {order, orderBy, onRequestSort, headCells} = props;
	const createSortHandler =
		(property: keyof Data) => (event: React.MouseEvent<unknown>) => {
			onRequestSort(event, property);
		};

	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align="left"
						padding="normal"
						sortDirection={orderBy === headCell.id ? order : false}
					>
						<TableSortLabel
							active={orderBy === headCell.id}
							direction={orderBy === headCell.id ? order : "asc"}
							onClick={createSortHandler(headCell.id)}
						>
							{headCell.label}
							{orderBy === headCell.id ? (
								<Box component="span" sx={visuallyHidden}>
									{order === "desc" ? "sorted descending" : "sorted ascending"}
								</Box>
							) : null}
						</TableSortLabel>
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface EnhancedTableToolbarProps {
	numExecution:number;
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
	const {numExecution} = props;
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [selectedCreatedTime, setSelectedCreatedTime] = useState();

	return (
		 <Box sx={{ flexGrow: 1, padding: "1em 0"}}>
			<Toolbar>
				<Typography sx={{ flexGrow: 1 }}>{numExecution} extractions run</Typography>
				{/*filter by status*/}
				<FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
					<InputLabel id="demo-simple-select-label">Status</InputLabel>
					  <Select
						labelId="demo-simple-select-label"
						id="demo-simple-select"
						value={selectedStatus}
						label="Status"
						onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setSelectedStatus(e.target.value);}}
					  >
						<MenuItem value="all">All</MenuItem>
						<MenuItem value="StatusMessage.start">Start</MenuItem>
						<MenuItem value="StatusMessage.processing">Processing</MenuItem>
						<MenuItem value="StatusMessage.done">Done</MenuItem>
						<MenuItem value="StatusMessage.failed">Failed</MenuItem>
					  </Select>
				</FormControl>
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<DateTimePicker
						label="Submitted at"
						value={selectedCreatedTime}
						onChange={(value)=>{setSelectedCreatedTime(value);}}
						renderInput={(props) => <ClowderMetadataTextField {...props} variant="standard"/>}
					/>
				</LocalizationProvider>
			</Toolbar>
		 </Box>
	);
};

export const ExtractionJobs = (props) => {
	const {rows, headCells} = props;

	const [order, setOrder] = React.useState<Order>("asc");
	const [orderBy, setOrderBy] = React.useState<keyof Data>("created");
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);

	const handleRequestSort = (
		event: React.MouseEvent<unknown>,
		property: keyof Data,
	) => {
		const isAsc = orderBy === property && order === "asc";
		setOrder(isAsc ? "desc" : "asc");
		setOrderBy(property);
	};

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};
	// Avoid a layout jump when reaching the last page with empty rows.
	const emptyRows =
		page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

	return (
		<Box sx={{width: "100%"}}>
			<Paper sx={{width: "100%", mb: 2}}>
				<TableContainer>
					<EnhancedTableToolbar numExecution={rows.length}/>
					<Table
						sx={{minWidth: 750}}
						aria-labelledby="tableTitle"
						size={"medium"}
					>
						<EnhancedTableHead
							order={order}
							orderBy={orderBy}
							onRequestSort={handleRequestSort}
							headCells={headCells}
						/>
						<TableBody>
							{
								stableSort(rows, getComparator(order, orderBy))
								.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
								.map((row) => {
									return (
										<TableRow key={row.jobId}>
											<TableCell align="right" sx={{color:theme.palette.primary.main}}>
											{
												row.status.includes("StatusMessage.start")? <PlayCircleOutlineIcon />:null
											}
											{
												row.status.includes("StatusMessage.processing") ?<AccessTimeIcon />: null
											}
											{
												row.status.includes("StatusMessage.done") ? <CheckCircleIcon />: null
											}
											{
												row.status.includes("StatusMessage.failed") ? <CancelIcon />: null
											}
											</TableCell>
											<TableCell align="left">{row.jobId}</TableCell>
											<TableCell align="left">{row.created}</TableCell>
											<TableCell align="left">{row.creator}</TableCell>
											<TableCell align="left">{row.duration}</TableCell>
											<TableCell align="left">{row.fileId}</TableCell>
										</TableRow>
									);
								})
							}
							{emptyRows > 0 && (
								<TableRow
									style={{
										height: (53) * emptyRows,
									}}
								>
									<TableCell colSpan={6}/>
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
}
