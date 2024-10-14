import React from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import {
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ClowderMetadataTextField } from "../styledComponents/ClowderMetadataTextField";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CachedIcon from "@mui/icons-material/Cached";
import IconButton from "@mui/material/IconButton";
import config from "../../app.config";

interface ExtractionJobsToolbarProps {
	numExecution: number;
	selectedStatus: string;
	selectedCreatedTime: string;
	setSelectedStatus: any;
	setSelectedCreatedTime: any;
	handleRefresh: any;
}

export const ExtractionJobsToolbar = (props: ExtractionJobsToolbarProps) => {
	const {
		numExecution,
		selectedStatus,
		selectedCreatedTime,
		setSelectedStatus,
		setSelectedCreatedTime,
		handleRefresh,
	} = props;

	return (
		<Box sx={{ flexGrow: 1, padding: "1em 0" }}>
			<Toolbar>
				<IconButton onClick={handleRefresh}>
					<CachedIcon />
				</IconButton>
				<Typography sx={{ flexGrow: 1 }}>{numExecution} extractions</Typography>
				{/*filter by status*/}
				<FormControl
					variant="standard"
					sx={{ m: 1, minWidth: 120, textTransform: "capitalize" }}
				>
					<InputLabel id="demo-simple-select-label">Status</InputLabel>
					<Select
						labelId="demo-simple-select-label"
						id="demo-simple-select"
						value={selectedStatus}
						defaultValue={null}
						label="Status"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setSelectedStatus(e.target.value);
						}}
					>
						{Object.keys(config.eventListenerJobStatus).map((status) => {
							return (
								<MenuItem
									value={config.eventListenerJobStatus[status]}
									sx={{ textTransform: "capitalize" }}
								>
									{status}
								</MenuItem>
							);
						})}
					</Select>
				</FormControl>
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<DatePicker
						label="Submitted on"
						value={selectedCreatedTime}
						onChange={(value) => {
							setSelectedCreatedTime(value);
						}}
						renderInput={(props) => (
							<ClowderMetadataTextField {...props} variant="standard" />
						)}
					/>
				</LocalizationProvider>
			</Toolbar>
		</Box>
	);
};
