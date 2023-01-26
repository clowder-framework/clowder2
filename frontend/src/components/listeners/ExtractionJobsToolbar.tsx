import React, {useState} from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import {FormControl, InputLabel, MenuItem, Select, Typography} from "@mui/material";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";
import {ClowderMetadataTextField} from "../styledComponents/ClowderMetadataTextField";

interface ExtractionJobsToolbarProps {
	numExecution:number;
}

export const ExtractionJobsToolbar = (props: ExtractionJobsToolbarProps) => {
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
