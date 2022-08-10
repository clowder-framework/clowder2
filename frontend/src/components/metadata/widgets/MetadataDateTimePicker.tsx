import React, {useState} from "react";
import {LocalizationProvider, DateTimePicker} from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterDateFns";
import {ClowderMetadataTextField} from "../../styledComponents/ClowderMetadataTextField";
import {MetadataEditButton} from "./MetadataEditButton";


export const MetadataDateTimePicker = (props) => {
	const {widgetName, fieldName, metadataId, contents, setMetadata, initialReadOnly, resourceId, updateMetadata} = props;
	const [localContent, setLocalContent] = useState(contents && contents[fieldName] ? contents: {});

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	const [inputChanged, setInputChanged] = useState(false);

	const handleChange = (newValue:Date) => {
		setInputChanged(true);

		let tempContents: { [key: string]: Date; } = {};
		tempContents[fieldName] = newValue;
		setMetadata ?
			metadataId ?
				setMetadata({
					"id": metadataId,
					"definition": widgetName,
					"contents": tempContents
				})
				:
				setMetadata({
					"definition": widgetName,
					"contents": tempContents
				})
			:
			null
		setLocalContent(tempContents)
	};

	return (
		<div style={{margin:"1.1em auto"}}>
			<LocalizationProvider dateAdapter={DateAdapter}>
				<DateTimePicker
					label={widgetName}
					value={readOnly && contents ? contents[fieldName]: localContent[fieldName]}
					onChange={handleChange}
					renderInput={(params) =>
						<ClowderMetadataTextField {...params} fullWidth
												  helperText={inputChanged? "* You have changed this field. " +
													  "Remember to save/ update.": ""}/>}
					disabled={readOnly}
				/>
			</LocalizationProvider>
			<MetadataEditButton readOnly={readOnly} setReadOnly={setReadOnly} updateMetadata={updateMetadata}
								contents={localContent} metadataId={metadataId} resourceId={resourceId}
								widgetName={widgetName} setInputChanged={setInputChanged}
								setMetadata={setMetadata}/>
		</div>
	);
}
