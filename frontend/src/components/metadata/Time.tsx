import React, {useState} from "react";
import {LocalizationProvider, DateTimePicker} from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterDateFns";
import {TextField} from "@mui/material";

export const Time = (props) => {
	const {widgetName, key} = props;
	const [value, setValue] = useState(new Date());

	const id = `time-${key}`;

	const handleChange = (newValue:Date) => {
		setValue(newValue);
	};

	return (
		<LocalizationProvider dateAdapter={DateAdapter}>
			<DateTimePicker
				label={widgetName}
				value={value}
				onChange={handleChange}
				renderInput={(params) => <TextField id={id} {...params} fullWidth/>}
			/>
		</LocalizationProvider>
	);
}
