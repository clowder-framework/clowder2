import React, {useState} from "react";
import {Button, TextField, Typography} from "@mui/material";

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
									alternateName: alternativeName
								}});
							resetForm();
							setReadOnly(true);
						}}>Save</Button>
					</>
			}
		</>
	)
}
