import React, {useState} from "react";
import {MetadataButtonGroup} from "./MetadataButtonGroup";
import { ClowderMetadataTextField } from "../styledComponents/ClowderMetadataTextField";

export const AlternativeTitle = (props) => {
	const {widgetName, resourceId, contents, updateMetadata, saveMetadata, deleteMetadata, metadataId,
		initialReadOnly} = props;
	const [alternativeName, setAlternativeName] = useState(contents && contents.alternateName ? contents.alternateName: "");

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	return (
		<>
			<ClowderMetadataTextField label={widgetName} variant="outlined" margin="normal"
					   fullWidth
					   name={widgetName}
					   value={readOnly && contents? contents.alternateName: alternativeName}
					   onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setAlternativeName(event.target.value);}}
					   disabled={readOnly}
			/>
			<MetadataButtonGroup readOnly={readOnly}
								 setReadOnly={setReadOnly}
								 metadataId={metadataId}
								 updateMetadata={updateMetadata}
								 saveMetadata={saveMetadata}
								 deleteMetadata={deleteMetadata}
								 resourceId={resourceId}
								 contents={{
									 alternateName: alternativeName
								 }}
								 widgetName={widgetName}
			/>
		</>
	)
}
