import * as React from "react";
import {InputLabel, MenuItem, FormControl} from "@mui/material";
import {useState} from "react";
import {MetadataButtonGroup} from "./MetadataButtonGroup";
import {ClowderMetadataSelect} from "../styledComponents/ClowderMetadataSelect";

export const Unit = (props) => {
	const {widgetName, metadataId, contents, updateMetadata, setMetadata, deleteMetadata, resourceId, initialReadOnly} = props;
	const [unit, setUnit] = React.useState(contents && contents.unit? contents.unit: "");

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setUnit(event.target.value);
		setMetadata ?
			metadataId?
				setMetadata({
					"definition": widgetName,
					"contents": {
						"unit":event.target.value,
					}
				})
				:
				setMetadata({
					"id":metadataId,
					"definition": widgetName,
					"contents": {
						"unit":event.target.value,
					}
				})
			:
			null
	};

	return (
		<>
			<div style={{margin: "1em auto"}}>
				<FormControl fullWidth>
					<InputLabel>{widgetName}</InputLabel>
					<ClowderMetadataSelect value={readOnly && contents ? contents.unit: unit}
							label="Unit" onChange={handleChange}
							sx={{background:"#ffffff"}}
							disabled={readOnly}
					>
						<MenuItem value={"A"}>Ampere</MenuItem>
						<MenuItem value={"K"}>Kelvin</MenuItem>
						<MenuItem value={"s"}>Second</MenuItem>
					</ClowderMetadataSelect>
				</FormControl>
			</div>
			<MetadataButtonGroup readOnly={readOnly}
								 setReadOnly={setReadOnly}
								 metadataId={metadataId}
								 setMetadata={setMetadata}
								 updateMetadata={updateMetadata}
								 deleteMetadata={deleteMetadata}
								 resourceId={resourceId}
								 contents={{
									 "unit":unit
								 }}
								 widgetName={widgetName}
			/>
		</>
	);
}
