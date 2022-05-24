import * as React from "react";
import {InputLabel, MenuItem, Select, FormControl, Button} from "@mui/material";
import crypto from "crypto";
import {useState} from "react";

export const Unit = (props) => {
	const {widgetName, metadataId, contents, saveMetadata, resourceId} = props;
	const [unit, setUnit] = React.useState("");
	const [readOnly, setReadOnly] = useState(!!metadataId);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setUnit(event.target.value);
	};

	const resetForm = () => {
		setUnit("");
	}

	return (
		<>
			<FormControl fullWidth>
				<InputLabel>{widgetName}</InputLabel>
				<Select value={readOnly && contents ? contents.unit: unit} label="Unit" onChange={handleChange}
				>
					<MenuItem value={"A"}>Ampere</MenuItem>
					<MenuItem value={"K"}>Kelvin</MenuItem>
					<MenuItem value={"s"}>Second</MenuItem>
				</Select>
			</FormControl>
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
									"unit":unit
								}});
							resetForm();
							setReadOnly(true);
						}}>Save</Button>
					</>
			}
		</>
	);
}
