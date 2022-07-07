import React, {useState} from "react";
import {LocalizationProvider, DateTimePicker} from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterDateFns";
import {MetadataButtonGroup} from "./MetadataButtonGroup";
import {ClowderMetadataTextField} from "../styledComponents/ClowderMetadataTextField";

export const Time = (props) => {
	const {widgetName, metadataId, contents, updateMetadata, saveMetadata, deleteMetadata, resourceId, initialReadOnly} = props;
	const [value, setValue] = useState(contents && contents.time? contents.time: new Date());

	const [readOnly, setReadOnly] = useState(initialReadOnly);

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
						renderInput={(params) => <ClowderMetadataTextField {...params} fullWidth/>}
						disabled={readOnly}
					/>
				</LocalizationProvider>
			</div>
			<MetadataButtonGroup readOnly={readOnly}
								 setReadOnly={setReadOnly}
								 metadataId={metadataId}
								 updateMetadata={updateMetadata}
								 saveMetadata={saveMetadata}
								 deleteMetadata={deleteMetadata}
								 resourceId={resourceId}
								 contents={{
									 "time": value
								 }}
								 widgetName={widgetName}/>
		</>
	);
}
