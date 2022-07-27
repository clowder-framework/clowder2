import * as React from "react";
import {InputLabel, MenuItem, FormControl} from "@mui/material";
import {useState} from "react";
import {MetadataDeleteButton} from "../widgets/MetadataDeleteButton";
import {ClowderMetadataSelect} from "../../styledComponents/ClowderMetadataSelect";
import {ClowderMetadataFormHelperText} from "../../styledComponents/ClowderMetadataFormHelperText";

export const Unit = (props) => {
	const {widgetName, metadataId, contents, updateMetadata, setMetadata, deleteMetadata, resourceId, initialReadOnly} = props;
	const [unit, setUnit] = React.useState(contents && contents.unit? contents.unit: "");

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	const [inputChanged, setInputChanged] = useState(false);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputChanged(true);
		setUnit(event.target.value);
		setMetadata ?
			metadataId?
				setMetadata({
					"id":metadataId,
					"definition": widgetName,
					"contents": {
						"unit":event.target.value,
					}
				})
				:
				setMetadata({
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
						<MenuItem value={"Ampere"}>Ampere</MenuItem>
						<MenuItem value={"Kelvin"}>Kelvin</MenuItem>
						<MenuItem value={"Second"}>Second</MenuItem>
					</ClowderMetadataSelect>
					<ClowderMetadataFormHelperText>{inputChanged? "* You have changed this field. Remember to save/ update.": ""}
					</ClowderMetadataFormHelperText>
				</FormControl>
			</div>
			<MetadataDeleteButton readOnly={readOnly}
								  setReadOnly={setReadOnly}
								  metadataId={metadataId}
								  setMetadata={setMetadata}
								  updateMetadata={updateMetadata}
								  deleteMetadata={deleteMetadata}
								  resourceId={resourceId}
								  contents={{
									 "unit":unit
								 }}
								  setInputChanged={setInputChanged}
								  widgetName={widgetName}
			/>
		</>
	);
}
