import React, {useEffect, useState} from "react";
import {TextField} from "@mui/material";

export const DOI = (props) => {
	const {widgetName, key} = props;
	const [DOI, setDOI] = useState("");
	const [promptError, setPromptError] = useState(false);
	const DOIErrorText = "DOI must follow the format of doi:0000000/000000000000!";

	const id = `DOI-${key}`;

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
		<TextField label={widgetName} variant="outlined" margin="normal"
				   fullWidth id={id}
				   name={widgetName}
				   value={DOI}
				   onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setDOI(event.target.value);}}
				   error={promptError}
				   helperText={DOIErrorText}
		/>
	)
}
