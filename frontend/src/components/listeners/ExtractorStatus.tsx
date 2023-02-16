import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Button } from '@mui/material';

import ExtractorLogs from './ExtractorLogs'

function Row(props: { row: ReturnType<typeof createData> }) {
  const { row } = props;
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
        <TableCell style={{ borderBottom: "none" }}>{row.started}</TableCell>
        <TableCell style={{ borderBottom: "none" }}>{row.latestUpdated}</TableCell>
        <TableCell style={{ borderBottom: "none" }}>{row.latestStatus}</TableCell>
        <TableCell style={{ borderBottom: "none" }}>{row.timeElapsed}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={1}></TableCell>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ marginTop: 2, marginBottom: 5 }} style={{backgroundColor: '#FFF'}}>
                {/* Extractor logs component */}
                <ExtractorLogs rows={rows} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function ExtractorStatus(props: { job_id: string; }) {
    let job_id = props.job_id
    console.log("Job id updated")
    console.log(job_id)
    return (
    <TableContainer>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell><b>Started</b></TableCell>
            <TableCell><b>Latest Updated</b></TableCell>
            <TableCell><b>Latest Status</b></TableCell>
            <TableCell><b>Time Elapsed</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <Row key={row.name} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}


// TODO: Remove the hardcoded data below
// Currently used to render the static UI

function createData(
    started: string,
    latestUpdated: string,
    latestStatus: string,
    timeElapsed: string
  ) {
    return {
      started,
      latestUpdated,
      latestStatus,
      timeElapsed,
      history: [
        {
          timestamp: 'Wednesday, December 9, 2020 4:32:55.319 PM',
          status: 'DONE',
        },
        {
          timestamp: 'Wednesday, December 9, 2020 4:24:55.319 PM',
          status: 'START: Start processing',
        },
        {
          timestamp: 'Wednesday, December 9, 2020 4:12:55.319 PM',
          status: 'PROCESS: Downloading file',
        },
        {
          timestamp: 'Wednesday, December 9, 2020 3:56:55.319 PM',
          status: 'PROCESS: Uploading file metadata',
        },
        {
          timestamp: 'Wednesday, December 9, 2020 3:46:55.319 PM',
          status: 'SUBMITTED',
        },
      ],
    };
  }
  
  
  const rows = [
    createData('Wednesday, December 9, 2020 3:46:55.319 PM', 'Wednesday, December 9, 2020 4:32:55.319 PM', 'DONE', '2 mins'),
  ];
  
