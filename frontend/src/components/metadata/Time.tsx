import React, {useState} from "react";
import {LocalizationProvider, DateTimePicker} from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterDateFns";
import {Button, TextField} from "@mui/material";

export const Time = (props) => {
	const {widgetName, metadataId, contents, saveMetadata, resourceId} = props;
	const [value, setValue] = useState(new Date());
	const [readOnly, setReadOnly] = useState(!!metadataId);

	const resetForm = () => {
		setValue("");
	}

	const handleChange = (newValue:Date) => {
		setValue(newValue);
	};

	return (
		<>
			<LocalizationProvider dateAdapter={DateAdapter}>
				<DateTimePicker
					label={widgetName}
					value={readOnly && contents ? contents.time: value}
					onChange={handleChange}
					renderInput={(params) => <TextField {...params} fullWidth/>}
				/>
			</LocalizationProvider>
			{
				readOnly ?
					<Button variant="text" sx={{float:"right"}} onClick={() => {setReadOnly(false);}}>Edit</Button>
					:
					<>
						<Button variant="text" sx={{float:"right"}} onClick={() => {setReadOnly(true);}}>Cancel</Button>
						<Button variant="contained" sx={{float:"right"}} onClick={() => {
							// update metadata
							saveMetadata(resourceId, {
								"id":metadataId,
								"definition": widgetName,
								"contents": {
									"time":time
								}});
							resetForm();
							setReadOnly(true);
						}}>Save</Button>
					</>
			}
		</>
	);
}
