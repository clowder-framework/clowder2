import React, {useState} from "react";
import {MetadataButtonGroup} from "./MetadataButtonGroup";
import { ClowderMetadataTextField } from "../styledComponents/ClowderMetadataTextField";

export const AlternativeTitle = (props) => {
	const {widgetName, resourceId, contents, updateMetadata, setMetadata, deleteMetadata, metadataId,
		initialReadOnly} = props;
	const [alternativeName, setAlternativeName] = useState(contents && contents.alternateName ? contents.alternateName: "");

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	const [inputChanged, setInputChanged] = useState(false);

	return (
		<>
			<ClowderMetadataTextField label={widgetName} variant="outlined" margin="normal"
					   fullWidth
					   name={widgetName}
					   value={readOnly && contents? contents.alternateName: alternativeName}
					   onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
							setInputChanged(true);
							setAlternativeName(event.target.value);
							   setMetadata ?
								   metadataId ?
									   setMetadata({
										   "id":metadataId,
										   "definition": widgetName,
										   "contents": {
											   "alternateName":event.target.value,
										   }
									   })
									 :
									   setMetadata({
										   "definition": widgetName,
										   "contents": {
											   "alternateName":event.target.value,
										   }
									   })
								   :
								   null
					   }}
					   disabled={readOnly}
					   helperText={inputChanged? "* You have changed this field. Remember to save/ update.": ""}
			/>
			<MetadataButtonGroup readOnly={readOnly}
								 setReadOnly={setReadOnly}
								 metadataId={metadataId}
								 setMetadata={setMetadata}
								 updateMetadata={updateMetadata}
								 deleteMetadata={deleteMetadata}
								 setInputChanged={setInputChanged}
								 resourceId={resourceId}
								 contents={{
									 alternateName: alternativeName
								 }}
								 widgetName={widgetName}
			/>
		</>
	)
}
