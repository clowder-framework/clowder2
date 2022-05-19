import React, {useState} from "react";
import {TextField} from "@mui/material";

export const AlternativeTitle = (props) => {
	const {widgetName, key} = props;
	const [alternativeTitle, setAlternativeTitle] = useState("");
	const id = `alternative-title-${key}`;

	return (
		<TextField label={widgetName} variant="outlined" margin="normal"
				   fullWidth id={id}
				   name={widgetName}
				   value={alternativeTitle}
				   onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setAlternativeTitle(event.target.value);}}/>
	)
}
