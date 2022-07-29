import React, {useState} from "react";
import { ClowderMetadataTextField } from "../../styledComponents/ClowderMetadataTextField";
import { MetadataEditButton } from "./MetadataEditButton";

export const MetadataTextField = (props) => {
	const {widgetName, fieldName, contents, setMetadata, metadataId, updateMetadata, resourceId, initialReadOnly} = props;
	const [text, setText] = useState(contents && contents[fieldName] ? contents[fieldName]: "");

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	const [inputChanged, setInputChanged] = useState(false);

	return (
		<>
			<ClowderMetadataTextField label={widgetName} variant="outlined" margin="normal" fullWidth name={widgetName}
									  value={readOnly && contents? contents[fieldName]: text}
									  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
										  setInputChanged(true);
										  setText(event.target.value);

										  let contents: { [key: string]: string|number; } = {};
										  contents[fieldName] = event.target.value;
										  setMetadata ?
											  metadataId ?
												  setMetadata({
													  "id":metadataId,
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
									  }}
									  disabled={readOnly}
									  helperText={inputChanged? "* You have changed this field. Remember to save/ update.": ""}
			/>
			<MetadataEditButton readOnly={readOnly} setReadOnly={setReadOnly} updateMetadata={updateMetadata}
								contents={contents} metadataId={metadataId} resourceId={resourceId}
								widgetName={widgetName} setInputChanged={setInputChanged}
								setMetadata={setMetadata}
			/>
		</>
	)
}
