import * as React from "react";
import {InputLabel, MenuItem, Select, FormControl, Button} from "@mui/material";
import crypto from "crypto";
import {useState} from "react";
import {MetadataButtonGroup} from "./MetadataButtonGroup";

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
			<div style={{margin: "1em auto"}}>
				<FormControl fullWidth>
					<InputLabel>{widgetName}</InputLabel>
					<Select value={readOnly && contents ? contents.unit: unit}
							label="Unit" onChange={handleChange}
							sx={{background:"#ffffff"}}
					>
						<MenuItem value={"A"}>Ampere</MenuItem>
						<MenuItem value={"K"}>Kelvin</MenuItem>
						<MenuItem value={"s"}>Second</MenuItem>
					</Select>
				</FormControl>
			</div>
			<MetadataButtonGroup readOnly={readOnly}
								 setReadOnly={setReadOnly}
								 metadataId={metadataId}
								 saveMetadata={saveMetadata}
								 resourceId={resourceId}
								 contents={{
									 "unit":unit
								 }}
								 resetForm={resetForm}/>
		</>
	);
}
