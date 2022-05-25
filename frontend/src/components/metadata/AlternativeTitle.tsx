import React, {useState} from "react";
import {Button, TextField, Typography} from "@mui/material";
import {MetadataButtonGroup} from "./MetadataButtonGroup";

export const AlternativeTitle = (props) => {
	const {widgetName, resourceId, contents, saveMetadata, metadataId } = props;
	const [alternativeName, setAlternativeName] = useState("");
	const [readOnly, setReadOnly] = useState(!!metadataId);

	const resetForm = () => {
		setAlternativeName("");
	}

	return (
		<>
			<TextField label={widgetName} variant="outlined" margin="normal"
					   fullWidth
					   name={widgetName}
					   value={readOnly && contents? contents.alternateName: alternativeName}
					   onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setAlternativeName(event.target.value);}}
					   disabled={readOnly}
					   sx={{background:"#ffffff"}}
			/>
			<MetadataButtonGroup readOnly={readOnly}
								 setReadOnly={setReadOnly}
								 metadataId={metadataId}
								 saveMetadata={saveMetadata}
								 resourceId={resourceId}
								 contents={{
									 alternateName: alternativeName
								 }}
								 resetForm={resetForm}/>
		</>
	)
}
