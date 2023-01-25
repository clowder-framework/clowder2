import * as React from "react";
import {alpha} from "@mui/material/styles";
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
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import {visuallyHidden} from "@mui/utils";
import {parseDate} from "../../utils/common";

interface Data {
	jobId: string;
	created: string;
	creator: string;
	duration: number;
	fileId: string;
	datasetId: string;
}

function createData(
	jobId: string,
	created: string,
	creator: string,
	duration: number,
	fileId: string,
	datasetId: string,
): Data {
	return {
		jobId,
		created,
		creator,
		duration,
		fileId,
		datasetId
	};
}

const rows = [
	createData("63d146bc79a3d39c71d0e0b1", parseDate("2023-01-25T15:11:56.615Z"), "cwang138@illinois.edu", 500, "63d140925cda10061fcd6768"),
	createData("63d146bc79a3d39c71d0e0b1", parseDate("2023-01-25T15:11:56.615Z"), "mburnet2@illinois.edu", 200, "63d140925cda10061fcd6768"),
	createData("63d146bc79a3d39c71d0e0b1", parseDate("2023-01-25T15:11:56.615Z"), "cwang138@illinois.edu", 1200, "63d140925cda10061fcd6768"),
	createData("63d146bc79a3d39c71d0e0b1", parseDate("2023-01-25T15:11:56.615Z"), "mburnet2@illinois.edu", 700, "63d140925cda10061fcd6768"),
	createData("63d146bc79a3d39c71d0e0b1", parseDate("2023-01-25T15:11:56.615Z"), "mburnet2@illinois.edu", 920, "63d140925cda10061fcd6768"),
	createData("63d146bc79a3d39c71d0e0b1", parseDate("2023-01-25T15:11:56.615Z"), "mburnet2@illinois.edu", 1100, "63d140925cda10061fcd6768"),
	createData("63d146bc79a3d39c71d0e0b1", parseDate("2023-01-25T15:11:56.615Z"), "cwang138@illinois.edu", 130, "63d140925cda10061fcd6768"),
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

interface HeadCell {
	id: keyof Data;
	label: string;
}

const headCells: readonly HeadCell[] = [
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
		id: "fileId",
		label: "Resource Id",
	},
];

interface EnhancedTableProps {
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
	order: Order;
	orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const {order, orderBy, onRequestSort} =
		props;
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
	numSelected: number;
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
	const {numSelected} = props;

	return (
		<Toolbar
			sx={{
				pl: {sm: 2},
				pr: {xs: 1, sm: 1},
				...(numSelected > 0 && {
					bgcolor: (theme) =>
						alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
				}),
			}}
		>
			{numSelected > 0 ? (
				<Tooltip title="Delete">
					<IconButton>
						<DeleteIcon/>
					</IconButton>
				</Tooltip>
			) : (
				<Tooltip title="Filter list">
					<IconButton>
						<FilterListIcon/>
					</IconButton>
				</Tooltip>
			)}
		</Toolbar>
	);
};

export const ExtractionJobs = (props) => {
	const [order, setOrder] = React.useState<Order>("asc");
	const [orderBy, setOrderBy] = React.useState<keyof Data>("created");
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);

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
					<Table
						sx={{minWidth: 750}}
						aria-labelledby="tableTitle"
						size={"medium"}
					>
						<EnhancedTableHead
							order={order}
							orderBy={orderBy}
							onRequestSort={handleRequestSort}
						/>
						<TableBody>
							{/* if you don"t need to support IE11, you can replace the `stableSort` call with:
              rows.slice().sort(getComparator(order, orderBy)) */}
							{
								stableSort(rows, getComparator(order, orderBy))
								.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
								.map((row) => {
									return (
										<TableRow key={row.jobId}>
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
