import React, {useEffect, useState} from "react";
import {Button, TextField} from "@mui/material";
import {MetadataButtonGroup} from "./MetadataButtonGroup";

export const DOI = (props) => {
	const {widgetName, metadataId, contents, saveMetadata, resourceId} = props;
	const [DOI, setDOI] = useState("");
	const [promptError, setPromptError] = useState(false);
	const [readOnly, setReadOnly] = useState(false);
	const DOIErrorText = "DOI must follow the format of doi:0000000/000000000000!";

	const resetForm = () => {
		setDOI("");
	}

	useEffect(() => {
		setReadOnly(!!metadataId);
	}, [metadataId]);

	useEffect(() => {
		// If DOI doesn't follow the format (Regex)
		if (DOI !== ""){
			if (!/doi:[0-9]{7}\/[0-9]{12}/.test(DOI)){
				setPromptError(true);
			}
			else{
				setPromptError(false);
			}
		}
	}, [DOI]);
	return (
		<>
			<TextField label={widgetName} variant="outlined" margin="normal"
					   fullWidth
					   name={widgetName}
					   value={readOnly && contents ? contents.doi: DOI}
					   onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setDOI(event.target.value);}}
					   error={promptError}
					   helperText={DOIErrorText}
					   disabled={readOnly}
					   style={{background:"#ffffff"}}
			/>
			<MetadataButtonGroup readOnly={readOnly}
								 setReadOnly={setReadOnly}
								 metadataId={metadataId}
								 saveMetadata={saveMetadata}
								 resourceId={resourceId}
								 contents={{"doi":DOI}}
								 resetForm={resetForm}/>
		</>

	)
}
