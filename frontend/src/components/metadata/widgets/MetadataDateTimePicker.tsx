import React, {useState} from "react";
import {LocalizationProvider, DateTimePicker} from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterDateFns";
import {ClowderMetadataTextField} from "../../styledComponents/ClowderMetadataTextField";
import {MetadataEditButton} from "./MetadataEditButton";


export const MetadataDateTimePicker = (props) => {
	const {widgetName, fieldName, metadataId, contents, setMetadata, initialReadOnly, resourceId, updateMetadata} = props;
	const [value, setValue] = useState(contents && contents.time? contents.time: new Date());

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	const [inputChanged, setInputChanged] = useState(false);

	const handleChange = (newValue:Date) => {
		setInputChanged(true);
		setValue(newValue);

		let contents: { [key: string]: Date; } = {};
		contents[fieldName] = newValue;
		setMetadata ?
			metadataId ?
				setMetadata({
					"id": metadataId,
					"definition": widgetName,
					"contents": contents
				})
				:
				setMetadata({
					"definition": widgetName,
					"contents": contents
				})
			:
			null
	};

	return (
		<div style={{margin:"1.1em auto"}}>
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
			<MetadataEditButton readOnly={readOnly} setReadOnly={setReadOnly} updateMetadata={updateMetadata}
								contents={contents} metadataId={metadataId} resourceId={resourceId}
								widgetName={widgetName} setInputChanged={setInputChanged}
								setMetadata={setMetadata}/>
		</div>
	);
}
