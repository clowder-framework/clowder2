import React, {useState} from "react";
import {LocalizationProvider, DateTimePicker} from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterDateFns";
import {ClowderMetadataTextField} from "../../styledComponents/ClowderMetadataTextField";


export const MetadataDateTimePicker = (props) => {
	const {widgetName, metadataId, contents, setMetadata, initialReadOnly} = props;
	const [value, setValue] = useState(contents && contents.time? contents.time: new Date());

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	const [inputChanged, setInputChanged] = useState(false);

	const handleChange = (newValue:Date) => {
		setInputChanged(true);
		setValue(newValue);
		setMetadata ?
			metadataId ?
				setMetadata({
					"id": metadataId,
					"definition": widgetName,
					"contents": {
						"time":newValue,
					}
				})
				:
				setMetadata({
					"definition": widgetName,
					"contents": {
						"time":newValue,
					}
				})
			:
			null
	};

	return (
		<LocalizationProvider dateAdapter={DateAdapter}>
			<DateTimePicker
				label={widgetName}
				value={readOnly && contents ? contents.time: value}
				onChange={handleChange}
				renderInput={(params) =>
					<ClowderMetadataTextField {...params} fullWidth
											  helperText={inputChanged? "* You have changed this field. " +
												  "Remember to save/ update.": ""}/>}
				disabled={readOnly}
			/>
		</LocalizationProvider>
	);
}
