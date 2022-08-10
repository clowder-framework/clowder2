import React, {useState} from "react";
import { ClowderMetadataTextField } from "../../styledComponents/ClowderMetadataTextField";
import { MetadataEditButton } from "./MetadataEditButton";

export const MetadataTextField = (props) => {
	const {widgetName, fieldName, contents, setMetadata, metadataId, updateMetadata, resourceId, initialReadOnly} = props;
	const [localContent, setLocalContent] = useState(contents && contents[fieldName] ? contents: {});

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	const [inputChanged, setInputChanged] = useState(false);

	return (
		<>
			<ClowderMetadataTextField label={widgetName} variant="outlined" margin="normal" fullWidth name={widgetName}
									  value={readOnly && contents? contents[fieldName]: localContent[fieldName]}
									  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
										  setInputChanged(true);
										  let tempContents: { [key: string]: string|number; } = {};
										  tempContents[fieldName] = event.target.value;
										  setLocalContent(tempContents)
										  setMetadata ?
											  metadataId ?
												  setMetadata({
													  "id":metadataId,
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
									  }}
									  disabled={readOnly}
									  helperText={inputChanged? "* You have changed this field. Remember to save/ update.": ""}
			/>
			<MetadataEditButton readOnly={readOnly} setReadOnly={setReadOnly} updateMetadata={updateMetadata}
								contents={localContent} metadataId={metadataId} resourceId={resourceId}
								widgetName={widgetName} setInputChanged={setInputChanged}
								setMetadata={setMetadata}
			/>
		</>
	)
}
