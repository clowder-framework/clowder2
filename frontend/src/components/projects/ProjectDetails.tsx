import React from "react";
import {Box, Typography} from "@mui/material";
import {parseDate} from "../../utils/common";
import {StackedList} from "../util/StackedList";


export function ProjectDetails(props) {
	const {id, created, creator} = props.details;

	const details = new Map<
		string,
		{ value: string | undefined; info?: string }
	>();
	if (creator && creator.first_name && creator.last_name) {
		details.set("Owner", {
			value: `${creator.first_name} ${creator.last_name}`,
		});
	}
	details.set("Created", {
		value: parseDate(created),
		info: "Date and time of project creation",
	});

	return (
		<Box sx={{mt: 5, mb: 2}}>
			<Typography variant="h5" gutterBottom>
				Details
			</Typography>
			<StackedList keyValues={details}/>
		</Box>
	);
}
