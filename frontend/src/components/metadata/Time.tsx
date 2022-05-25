import React, {useState} from "react";
import {LocalizationProvider, DateTimePicker} from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterDateFns";
import {Button, TextField} from "@mui/material";
import {MetadataButtonGroup} from "./MetadataButtonGroup";

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
			<div style={{margin:"1.1em auto", background:"#ffffff"}}>
				<LocalizationProvider dateAdapter={DateAdapter}>
					<DateTimePicker
						label={widgetName}
						value={readOnly && contents ? contents.time: value}
						onChange={handleChange}
						renderInput={(params) => <TextField {...params} fullWidth/>}
					/>
				</LocalizationProvider>
			</div>
			<MetadataButtonGroup readOnly={readOnly}
								 setReadOnly={setReadOnly}
								 metadataId={metadataId}
								 saveMetadata={saveMetadata}
								 resourceId={resourceId}
								 contents={{
									 "time": value
								 }}
								 resetForm={resetForm}/>
		</>
	);
}
