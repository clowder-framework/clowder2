import React, {useEffect, useState} from "react";
import {Button, TextField} from "@mui/material";

export const DOI = (props) => {
	const {widgetName, metadataId, contents, saveMetadata, resourceId} = props;
	const [DOI, setDOI] = useState("");
	const [promptError, setPromptError] = useState(false);
	const [readOnly, setReadOnly] = useState(!!metadataId);
	const DOIErrorText = "DOI must follow the format of doi:0000000/000000000000!";

	const resetForm = () => {
		setDOI("");
	}

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
					   sx={{background:"#ffffff"}}
			/>
			{
				readOnly ?
					<Button variant="text" sx={{float:"right"}} onClick={() => {setReadOnly(false);}}>Edit</Button>
					:
					<>
						<Button variant="text" sx={{float:"right"}} onClick={() => {setReadOnly(true);}}>Cancel</Button>
						<Button variant="contained" sx={{float:"right"}} onClick={() => {
							// update metadata
							saveMetadata(resourceId, {
								"id":metadataId,
								"definition": widgetName,
								"contents": {
									"doi":DOI
								}});
							resetForm();
							setReadOnly(true);
						}}>Save</Button>
					</>
			}
		</>

	)
}
