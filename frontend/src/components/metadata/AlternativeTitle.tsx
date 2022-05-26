import React, {useState} from "react";
import {MetadataButtonGroup} from "./MetadataButtonGroup";
import { ClowderMetadataTextField } from "../styledComponents/ClowderMetadataTextField";

export const AlternativeTitle = (props) => {
	const {widgetName, resourceId, contents, updateMetadata, saveMetadata, metadataId } = props;
	const [alternativeName, setAlternativeName] = useState("");
	const [readOnly, setReadOnly] = useState(!!metadataId);

	const resetForm = () => {
		setAlternativeName("");
	}

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
								 resourceId={resourceId}
								 contents={{
									 alternateName: alternativeName
								 }}
								 resetForm={resetForm}
								 widgetName={widgetName}
			/>
		</>
	)
}
