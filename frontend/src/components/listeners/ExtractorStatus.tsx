import React, { useEffect } from "react";
import {
	Box,
	Collapse,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { parseDate } from "../../utils/common";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { fetchJobSummary, fetchJobUpdates } from "../../actions/listeners";

function Row (props: { summary: any; updates: any; }) {
	const { summary, updates } = props;
	const [ open, setOpen ] = React.useState(true);

	return (
		<React.Fragment>
			<TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
				<TableCell style={{ borderBottom: "none" }}>
					<IconButton
						aria-label="expand row"
						size="small"
						onClick={() => setOpen(!open)}
					>
						{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
					</IconButton>
				</TableCell >
				<TableCell style={{ borderBottom: "none" }}>{parseDate(summary.created)}</TableCell>
				<TableCell style={{ borderBottom: "none" }}>{parseDate(summary.updated)}</TableCell>
				<TableCell style={{ borderBottom: "none" }}>{summary.latest_message}</TableCell>
				<TableCell style={{ borderBottom: "none" }}>{summary.duration} sec</TableCell>
			</TableRow>
			<TableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={1} />
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
					<Collapse in={open} timeout="auto" unmountOnExit>
						<Box sx={{ marginTop: 2, marginBottom: 5 }} style={{backgroundColor: "#FFF"}}>
							{/* Extractor logs component */}
							<div className="container">
								{updates.length > 0 ? 
									<Box
										sx={{
											margin: "2%",
											padding: "2%",
											width: "95%",
											backgroundColor: "#EAEAEA",
											fontFamily: "Monospace",
											fontSize: "11px"
										}}
									>
										<dl>
											{updates.map((update) => (
												<dt>$ {parseDate(update.timestamp)} {update.status}</dt>
											))}
										</dl>
									</Box>
									: <></>}
							</div>
						</Box>
					</Collapse>
				</TableCell>
			</TableRow>
		</React.Fragment>
	);
}

export default function ExtractorStatus(props: { job_id: any; }) {
	const job_id = props.job_id;

	const dispatch = useDispatch();

	const jobSummaryFetch = (job_id: string | undefined) => dispatch(fetchJobSummary(job_id));
	const jobUpdatesFetch = (job_id: string | undefined) => dispatch(fetchJobUpdates(job_id));

	const summary = useSelector((state: RootState) => state.listener.currJobSummary);
	const updates = useSelector((state: RootState) => state.listener.currJobUpdates);

	useEffect(() => {
		const interval = setInterval(() => {
			if (job_id.length > 0) {
				jobSummaryFetch(job_id);
				jobUpdatesFetch(job_id);
			}
		}, 2000);

		return () => clearInterval(interval);
	}, [job_id]);

	return (
		<TableContainer>
			<Table aria-label="collapsible table">
				<TableHead>
					<TableRow>
						<TableCell />
						<TableCell><b>Created</b></TableCell>
						<TableCell><b>Latest Updated</b></TableCell>
						<TableCell><b>Latest Status</b></TableCell>
						<TableCell><b>Time Elapsed</b></TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{Object.keys(summary).length > 0 ? <Row summary={summary} updates={updates} /> : <></>}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
