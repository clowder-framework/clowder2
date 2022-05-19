import React, {useState} from "react";
import {TextField, Typography} from "@mui/material";

export const AlternativeTitle = (props) => {
	const {widgetName, key, contents, readOnly} = props;
	const [alternativeTitle, setAlternativeTitle] = useState("");
	const id = `alternative-title-${key}`;

	return (
		<>
			<Typography>{widgetName}</Typography>
			<TextField label={widgetName} variant="outlined" margin="normal"
					   fullWidth id={id}
					   name={widgetName}
					   value={readOnly? contents.alternateName: alternativeTitle}
					   onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setAlternativeTitle(event.target.value);}}
					   disabled={readOnly ? true: false}
			/>
		</>
	)
}
