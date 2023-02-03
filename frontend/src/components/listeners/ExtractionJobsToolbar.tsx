import React from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import {FormControl, InputLabel, MenuItem, Select, Typography} from "@mui/material";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {ClowderMetadataTextField} from "../styledComponents/ClowderMetadataTextField";
import {DatePicker} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import CachedIcon from '@mui/icons-material/Cached';
import IconButton from "@mui/material/IconButton";

interface ExtractionJobsToolbarProps {
	numExecution:number;
	selectedStatus: string;
	selectedCreatedTime: string;
	setSelectedStatus: any;
	setSelectedCreatedTime: any;
	handleRefresh: any;
}

export const ExtractionJobsToolbar = (props: ExtractionJobsToolbarProps) => {
	const {numExecution, selectedStatus, selectedCreatedTime, setSelectedStatus, setSelectedCreatedTime,
		handleRefresh} = props;

	return (
		 <Box sx={{ flexGrow: 1, padding: "1em 0"}}>
			<Toolbar>
				<IconButton onClick={handleRefresh}>
					<CachedIcon />
				</IconButton>
				<Typography sx={{ flexGrow: 1 }}>{numExecution} extractions</Typography>
				{/*filter by status*/}
				<FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
					<InputLabel id="demo-simple-select-label">Status</InputLabel>
					  <Select
						labelId="demo-simple-select-label"
						id="demo-simple-select"
						value={selectedStatus}
						defaultValue={null}
						label="Status"
						onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setSelectedStatus(e.target.value);}}
					  >
						<MenuItem value="StatusMessage.start">Start</MenuItem>
						<MenuItem value="StatusMessage.processing">Processing</MenuItem>
						<MenuItem value="StatusMessage.done">Done</MenuItem>
						<MenuItem value="StatusMessage.failed">Failed</MenuItem>
					  </Select>
				</FormControl>
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<DatePicker
						label="Submitted at"
						value={selectedCreatedTime}
						onChange={(value)=>{
							setSelectedCreatedTime(value);
						}}
						renderInput={(props) => <ClowderMetadataTextField {...props} variant="standard"/>}
					/>
				</LocalizationProvider>
			</Toolbar>
		 </Box>
	);
};
