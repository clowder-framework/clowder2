import React from "react";
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { parseDate, calculateElapsedTime } from "../../utils/common";

function Row (props: { summary: any; updates: any; }) {
  const { summary, updates } = props;
  const [ open, setOpen ] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
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
        <TableCell style={{ borderBottom: "none" }}>{calculateElapsedTime(summary.updated, summary.created)} s</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={1}></TableCell>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ marginTop: 2, marginBottom: 5 }} style={{backgroundColor: '#FFF'}}>
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

export default function ExtractorStatus(props: { job_id: any; summary: any; updates: any; }) {
    let job_id = props.job_id
    let summary = props.summary
    let updates = props.updates

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
